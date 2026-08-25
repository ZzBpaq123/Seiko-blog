package com.seiko.blog.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.seiko.common.constant.RedisConstant;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.lang.Nullable;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.HashMap;
import java.util.Map;

/**
 * Redis 缓存配置
 * <p>
 * 基于 Spring Cache 抽象 + Redis 后端，对博客前台高频读接口做缓存：
 * <ul>
 *     <li>key 使用字符串序列化，前缀为 {@code cacheName:}，便于排查</li>
 *     <li>value 使用 JSON 序列化（携带 {@code @class} 类型信息），可正确反序列化
 *         {@code List<VO>} 与 MyBatis-Plus 的 {@code Page<VO>}</li>
 *     <li>默认 TTL 兜底防止陈旧/雪崩，{@code comment} 区使用较短 TTL</li>
 * </ul>
 * 同时启用 {@link EnableScheduling}，供文章阅读数定时回刷任务使用。
 */
@Configuration
@EnableCaching
@EnableScheduling
@Slf4j
public class RedisCacheConfig implements CachingConfigurer {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisSerializationContext.SerializationPair<Object> valueSerializer =
                RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer());

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(RedisConstant.DEFAULT_TTL)
                // 不缓存 null，避免穿透污染
                .disableCachingNullValues()
                // key 前缀使用 cacheName:，与现有 login:* 键风格一致
                .computePrefixWith(cacheName -> cacheName + ":")
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(valueSerializer);

        // 按区差异化 TTL
        Map<String, RedisCacheConfiguration> initialConfigs = new HashMap<>();
        initialConfigs.put(RedisConstant.CACHE_COMMENT, defaultConfig.entryTtl(RedisConstant.COMMENT_TTL));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(initialConfigs)
                .build();
    }

    /**
     * 缓存错误处理器：缓存读写异常（如历史数据反序列化失败、Redis 抖动）不应影响主流程。
     * <p>读失败时清除问题键并按未命中处理，回源数据库后以新格式覆盖写回，实现自愈。
     */
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(@NonNull RuntimeException exception, @NonNull Cache cache, @NonNull Object key) {
                log.warn("缓存读取失败，按未命中处理并清除问题键 [{}:{}]：{}", cache.getName(), key, exception.getMessage());
                try {
                    cache.evict(key);
                } catch (RuntimeException evictEx) {
                    log.warn("清除问题缓存键失败 [{}:{}]：{}", cache.getName(), key, evictEx.getMessage());
                }
            }

            @Override
            public void handleCachePutError(@NonNull RuntimeException exception, @NonNull Cache cache, @NonNull Object key, @Nullable Object value) {
                log.warn("缓存写入失败 [{}:{}]：{}", cache.getName(), key, exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(@NonNull RuntimeException exception, @NonNull Cache cache, @NonNull Object key) {
                log.warn("缓存清除失败 [{}:{}]：{}", cache.getName(), key, exception.getMessage());
            }

            @Override
            public void handleCacheClearError(@NonNull RuntimeException exception, @NonNull Cache cache) {
                log.warn("缓存清空失败 [{}]：{}", cache.getName(), exception.getMessage());
            }
        };
    }

    /**
     * 构建携带类型信息的 JSON 序列化器。
     * <p>
     * 缓存仅需对象的忠实往返，因此：
     * <ul>
     *     <li>只按字段读写、关闭 getter/setter 可见性，避免 {@code Page} 等的计算型 getter 干扰反序列化</li>
     *     <li>关闭 Jackson 注解，使面向 API 输出的 {@code @JsonFormat}（如 {@code yyyy-MM-dd}）不影响
     *         {@code LocalDateTime} 的 ISO 往返</li>
     *     <li>忽略未知属性，提升对历史数据/字段变更的容错</li>
     *     <li>写入 {@code @class} 类型信息，反序列化时还原具体类型（List / Page 等）</li>
     * </ul>
     */
    private GenericJackson2JsonRedisSerializer jsonSerializer() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        // 仅按字段序列化，关闭 getter/setter，避免计算型属性破坏往返
        objectMapper.setVisibility(PropertyAccessor.FIELD, JsonAutoDetect.Visibility.ANY);
        objectMapper.setVisibility(PropertyAccessor.GETTER, JsonAutoDetect.Visibility.NONE);
        objectMapper.setVisibility(PropertyAccessor.IS_GETTER, JsonAutoDetect.Visibility.NONE);
        objectMapper.setVisibility(PropertyAccessor.SETTER, JsonAutoDetect.Visibility.NONE);
        // 关闭注解，使 @JsonFormat 等输出注解不影响缓存往返
        objectMapper.disable(MapperFeature.USE_ANNOTATIONS);
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        // 写入 @class 类型信息，反序列化时还原具体类型（List / Page 等）
        objectMapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY);
        return new GenericJackson2JsonRedisSerializer(objectMapper);
    }
}
