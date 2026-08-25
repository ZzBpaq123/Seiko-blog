package com.seiko.blog.component;

import com.seiko.common.constant.RedisConstant;
import com.seiko.common.exception.BusinessException;
import com.seiko.common.result.ResultCode;
import com.seiko.blog.config.LoginRateLimitProperties;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * 登录速率限制器
 * <p>
 * 基于 Redis 实现，支持账号级和 IP 级双重限制：
 * <ul>
 *     <li>账号级：防止针对单个账号的暴力破解</li>
 *     <li>IP 级：防止同一 IP 对多个账号进行批量枚举</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LoginRateLimiter {

    private final StringRedisTemplate redisTemplate;
    private final LoginRateLimitProperties properties;

    /**
     * 检查当前登录请求是否已被限制
     *
     * @param request  HTTP 请求
     * @param username 登录用户名
     */
    public void check(HttpServletRequest request, String username) {
        if (!properties.isEnabled()) {
            return;
        }

        String accountKey = normalizeUsername(username);
        String ip = getClientIp(request);

        String accountLockKey = RedisConstant.ACCOUNT_LOCK_PREFIX + accountKey;
        if (redisTemplate.hasKey(accountLockKey)) {
            throw new BusinessException(ResultCode.TOO_MANY_REQUESTS.getCode(), "登录失败次数过多，请 " + properties.getLockSeconds() / 60 + " 分钟后再试");
        }

        String ipLockKey = RedisConstant.LOGIN_IP_LOCK_PREFIX + ip;
        if (redisTemplate.hasKey(ipLockKey)) {
            throw new BusinessException(ResultCode.TOO_MANY_REQUESTS.getCode(), "当前 IP 登录失败次数过多，请 " + properties.getLockSeconds() / 60 + " 分钟后再试");
        }
    }

    /**
     * 记录一次登录失败
     *
     * @param request  HTTP 请求
     * @param username 登录用户名
     */
    public void recordFailure(HttpServletRequest request, String username) {
        if (!properties.isEnabled()) {
            return;
        }

        String accountKey = normalizeUsername(username);
        String ip = getClientIp(request);

        // 账号级失败计数
        Long accountFailCount = redisTemplate.opsForValue().increment(RedisConstant.ACCOUNT_FAIL_COUNT_PREFIX + accountKey);
        redisTemplate.expire(RedisConstant.ACCOUNT_FAIL_COUNT_PREFIX + accountKey, properties.getWindowSeconds(), TimeUnit.SECONDS);

        if (accountFailCount != null && accountFailCount >= properties.getMaxAttempts()) {
            redisTemplate.opsForValue().set(RedisConstant.ACCOUNT_LOCK_PREFIX + accountKey, "1", properties.getLockSeconds(), TimeUnit.SECONDS);
            redisTemplate.delete(RedisConstant.ACCOUNT_FAIL_COUNT_PREFIX + accountKey);
            log.warn("账号 [{}] 登录失败次数达到阈值，已锁定 {} 秒", accountKey, properties.getLockSeconds());
        }

        // IP 级失败计数
        Long ipFailCount = redisTemplate.opsForValue().increment(RedisConstant.IP_FAIL_COUNT_PREFIX + ip);
        redisTemplate.expire(RedisConstant.IP_FAIL_COUNT_PREFIX + ip, properties.getWindowSeconds(), TimeUnit.SECONDS);

        if (ipFailCount != null && ipFailCount >= properties.getIpMaxAttempts()) {
            redisTemplate.opsForValue().set(RedisConstant.LOGIN_IP_LOCK_PREFIX + ip, "1", properties.getLockSeconds(), TimeUnit.SECONDS);
            redisTemplate.delete(RedisConstant.IP_FAIL_COUNT_PREFIX + ip);
            log.warn("IP [{}] 登录失败次数达到阈值，已锁定 {} 秒", ip, properties.getLockSeconds());
        }
    }

    /**
     * 记录一次登录成功，清除该账号和 IP 的失败计数与锁定
     *
     * @param request  HTTP 请求
     * @param username 登录用户名
     */
    public void recordSuccess(HttpServletRequest request, String username) {
        if (!properties.isEnabled()) {
            return;
        }

        String accountKey = normalizeUsername(username);
        String ip = getClientIp(request);

        redisTemplate.delete(RedisConstant.ACCOUNT_FAIL_COUNT_PREFIX + accountKey);
        redisTemplate.delete(RedisConstant.IP_FAIL_COUNT_PREFIX + ip);
        redisTemplate.delete(RedisConstant.ACCOUNT_LOCK_PREFIX + accountKey);
        redisTemplate.delete(RedisConstant.LOGIN_IP_LOCK_PREFIX + ip);
    }

    /**
     * 获取客户端真实 IP，优先读取常见反向代理请求头
     */
    private String getClientIp(HttpServletRequest request) {
        String[] headerNames = {
                "X-Forwarded-For",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP",
                "HTTP_X_FORWARDED_FOR",
                "HTTP_X_FORWARDED",
                "HTTP_X_CLUSTER_CLIENT_IP",
                "HTTP_CLIENT_IP",
                "HTTP_FORWARDED_FOR",
                "HTTP_FORWARDED",
                "X-Real-IP"
        };

        for (String headerName : headerNames) {
            String ip = request.getHeader(headerName);
            if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
                // X-Forwarded-For 可能包含多个 IP，取第一个
                int commaIndex = ip.indexOf(',');
                if (commaIndex != -1) {
                    ip = ip.substring(0, commaIndex);
                }
                return ip.trim();
            }
        }

        return request.getRemoteAddr();
    }

    /**
     * 统一用户名格式，避免大小写差异导致计数分散
     */
    private String normalizeUsername(String username) {
        return username == null ? "anonymous" : username.trim().toLowerCase();
    }

}
