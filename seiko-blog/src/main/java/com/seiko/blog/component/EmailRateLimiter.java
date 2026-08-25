package com.seiko.blog.component;

import com.seiko.common.constant.RedisConstant;
import com.seiko.common.exception.BusinessException;
import com.seiko.common.result.ResultCode;
import com.seiko.blog.config.VerificationCodeProperties;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * 邮箱验证码发送速率限制器
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EmailRateLimiter {

    private final StringRedisTemplate redisTemplate;
    private final VerificationCodeProperties properties;

    /**
     * 检查是否可以向指定邮箱发送验证码
     */
    public void check(HttpServletRequest request, String email) {
        if (!properties.isEnabled()) {
            return;
        }

        String normalizedEmail = normalizeEmail(email);
        String ip = getClientIp(request);

        String emailCooldownKey = RedisConstant.EMAIL_COOLDOWN_PREFIX + normalizedEmail;
        if (redisTemplate.hasKey(emailCooldownKey)) {
            throw new BusinessException(ResultCode.VERIFICATION_CODE_TOO_FREQUENT);
        }

        String ipLockKey = RedisConstant.EMAIL_IP_LOCK_PREFIX + ip;
        if (redisTemplate.hasKey(ipLockKey)) {
            throw new BusinessException(ResultCode.VERIFICATION_CODE_TOO_FREQUENT.getCode(),
                    "当前 IP 发送验证码次数过多，请 " + properties.getIpLockSeconds() / 60 + " 分钟后再试");
        }
    }

    /**
     * 记录一次验证码发送
     */
    public void recordSend(HttpServletRequest request, String email) {
        if (!properties.isEnabled()) {
            return;
        }

        String normalizedEmail = normalizeEmail(email);
        String ip = getClientIp(request);

        redisTemplate.opsForValue().set(RedisConstant.EMAIL_COOLDOWN_PREFIX + normalizedEmail, "1",
                properties.getResendCooldownSeconds(), TimeUnit.SECONDS);

        String ipCountKey = RedisConstant.IP_COUNT_PREFIX + ip;
        Long ipSendCount = redisTemplate.opsForValue().increment(ipCountKey);
        redisTemplate.expire(ipCountKey, 3600, TimeUnit.SECONDS);

        if (ipSendCount != null && ipSendCount >= properties.getIpMaxSendsPerHour()) {
            redisTemplate.opsForValue().set(RedisConstant.EMAIL_IP_LOCK_PREFIX + ip, "1",
                    properties.getIpLockSeconds(), TimeUnit.SECONDS);
            redisTemplate.delete(ipCountKey);
            log.warn("IP [{}] 邮箱验证码发送次数达到阈值，已锁定 {} 秒", ip, properties.getIpLockSeconds());
        }
    }

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
                int commaIndex = ip.indexOf(',');
                if (commaIndex != -1) {
                    ip = ip.substring(0, commaIndex);
                }
                return ip.trim();
            }
        }

        return request.getRemoteAddr();
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
