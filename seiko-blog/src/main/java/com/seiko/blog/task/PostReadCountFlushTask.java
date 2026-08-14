package com.seiko.blog.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.seiko.blog.config.RedisCacheConfig;
import com.seiko.blog.entity.Post;
import com.seiko.blog.mapper.PostMapper;
import com.seiko.blog.service.impl.PostServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 文章阅读数回刷定时任务
 * <p>
 * 文章详情已被缓存，无法依赖每次访问写库累加阅读数。访问时由
 * {@link PostServiceImpl#incrementReadCountAndGet(Long, int)} 对 Redis 计数器
 * {@code post:read:{id}} 执行 INCR，本任务定时将增量回刷到 DB，并只失效受影响文章的详情缓存。
 * <p>
 * 与旧实现的差异：
 * <ul>
 *     <li>用 SCAN 游标替代 KEYS，避免 O(N) 命令阻塞 Redis 单线程</li>
 *     <li>用 GETDEL 原子取删计数器，避免「先 GET 再 DELETE」之间并发 INCR 的增量被误删</li>
 *     <li>回刷后只逐 slug 精确失效详情缓存，不再整区清空造成缓存雪崩；
 *         列表缓存中的阅读数在 TTL 自然过期或下次写操作时刷新</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PostReadCountFlushTask {

    private static final String READ_COUNT_PATTERN = PostServiceImpl.READ_COUNT_PREFIX + "*";

    private final StringRedisTemplate redisTemplate;
    private final PostMapper postMapper;
    private final CacheManager cacheManager;

    /**
     * 定时将 Redis 阅读数增量回刷到数据库。
     * <p>启动后延迟 1 小时首次执行，之后每 1 小时执行一次。
     */
    @Scheduled(initialDelayString = "3600000", fixedDelayString = "3600000")
    public void flush() {
        Set<String> keys = scanReadCountKeys();
        if (keys.isEmpty()) {
            return;
        }

        List<Long> updatedPostIds = new ArrayList<>();
        for (String key : keys) {
            Long postId = parsePostId(key);
            if (postId == null) {
                continue;
            }
            // 原子取并删，取出的值即本次待回刷增量
            String value = redisTemplate.opsForValue().getAndDelete(key);
            long delta = parseDelta(value);
            if (delta <= 0) {
                continue;
            }

            // read_num = read_num + delta
            postMapper.update(null, new LambdaUpdateWrapper<Post>()
                    .setSql("read_num = read_num + {0}", delta)
                    .eq(Post::getId, postId));
            updatedPostIds.add(postId);
        }

        if (!updatedPostIds.isEmpty()) {
            evictDetailCache(updatedPostIds);
            log.info("阅读数回刷完成，更新 {} 篇文章的阅读数", updatedPostIds.size());
        }
    }

    /**
     * 精确失效受影响文章的详情缓存（post:slug:{slug}），列表与标签缓存区保持不动。
     */
    private void evictDetailCache(List<Long> postIds) {
        List<Post> posts = postMapper.selectList(new LambdaQueryWrapper<Post>()
                .select(Post::getId, Post::getSlug)
                .in(Post::getId, postIds));
        Cache cache = cacheManager.getCache(RedisCacheConfig.CACHE_POST);
        if (cache == null) {
            return;
        }
        for (Post post : posts) {
            if (post.getSlug() != null) {
                cache.evict("slug:" + post.getSlug());
            }
        }
    }

    /**
     * 用 SCAN 游标扫描阅读数计数器 key，避免 KEYS 阻塞 Redis。
     */
    private Set<String> scanReadCountKeys() {
        return redisTemplate.execute((RedisCallback<Set<String>>) connection -> {
            Set<String> keys = new HashSet<>();
            try (Cursor<byte[]> cursor = connection.scan(
                    ScanOptions.scanOptions().match(READ_COUNT_PATTERN).count(100).build())) {
                while (cursor.hasNext()) {
                    keys.add(new String(cursor.next(), StandardCharsets.UTF_8));
                }
            }
            return keys;
        });
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
