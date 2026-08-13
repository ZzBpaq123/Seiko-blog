package com.seiko.blog.task;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.seiko.blog.config.RedisCacheConfig;
import com.seiko.blog.entity.Post;
import com.seiko.blog.mapper.PostMapper;
import com.seiko.blog.service.impl.PostServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * 文章阅读数回刷定时任务
 * <p>
 * 文章详情已被缓存，无法依赖每次访问写库累加阅读数。访问时由
 * {@link PostServiceImpl#incrementReadCountAndGet(Long, int)} 对 Redis 计数器
 * {@code post:read:{id}} 执行 INCR，本任务定时将增量回刷到 DB，并清空文章缓存区使基准值重新加载。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PostReadCountFlushTask {

    private final StringRedisTemplate redisTemplate;
    private final PostMapper postMapper;
    private final CacheManager cacheManager;

    /**
     * 定时将 Redis 阅读数增量回刷到数据库。
     * <p>启动后延迟 5 分钟首次执行，之后每 5 分钟执行一次。
     */
    @Scheduled(initialDelayString = "300000", fixedDelayString = "300000")
    public void flush() {
        Set<String> keys = redisTemplate.keys(PostServiceImpl.READ_COUNT_PREFIX + "*");
        if (keys.isEmpty()) {
            return;
        }

        int flushed = 0;
        for (String key : keys) {
            Long postId = parsePostId(key);
            if (postId == null) {
                continue;
            }
            String value = redisTemplate.opsForValue().get(key);
            long delta = parseDelta(value);
            if (delta <= 0) {
                redisTemplate.delete(key);
                continue;
            }

            // read_num = read_num + delta
            postMapper.update(null, new LambdaUpdateWrapper<Post>()
                    .setSql("read_num = read_num + " + delta)
                    .eq(Post::getId, postId));
            redisTemplate.delete(key);
            flushed++;
        }

        if (flushed > 0) {
            // 清空文章缓存区，使阅读数基准值重新从 DB 加载
            Cache cache = cacheManager.getCache(RedisCacheConfig.CACHE_POST);
            if (cache != null) {
                cache.clear();
            }
            log.info("阅读数回刷完成，更新 {} 篇文章并清空文章缓存", flushed);
        }
    }

    private Long parsePostId(String key) {
        try {
            return Long.valueOf(key.substring(PostServiceImpl.READ_COUNT_PREFIX.length()));
        } catch (NumberFormatException e) {
            log.warn("无法解析阅读数计数器 key: {}", key);
            return null;
        }
    }

    private long parseDelta(String value) {
        if (value == null) {
            return 0L;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            return 0L;
        }
    }
}
