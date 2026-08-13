package com.seiko.blog.service.impl;

import com.seiko.blog.component.EmailService;
import com.seiko.blog.config.VerificationCodeProperties;
import com.seiko.blog.service.VerificationCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

/**
 * 验证码服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationCodeServiceImpl implements VerificationCodeService {

    private final StringRedisTemplate redisTemplate;
    private final EmailService emailService;
    private final VerificationCodeProperties properties;

    private static final String EMAIL_CODE_PREFIX = "email:code:";

    @Override
    public String generateAndSend(String email) {
        String code = generateCode();
        String key = buildRedisKey(email);

        redisTemplate.opsForValue().set(key, code, properties.getCodeTtlSeconds(), TimeUnit.SECONDS);
        emailService.sendVerificationCode(email, code);

        log.info("已生成评论验证码，发送至 [{}]，TTL {} 秒", email, properties.getCodeTtlSeconds());
        return code;
    }

    @Override
    public boolean verify(String email, String code) {
        if (email == null || code == null) {
            return false;
        }

        String key = buildRedisKey(email);
        String storedCode = redisTemplate.opsForValue().get(key);

        if (storedCode == null) {
            return false;
        }

        if (!storedCode.equalsIgnoreCase(code.trim())) {
            return false;
        }

        redisTemplate.delete(key);
        return true;
    }

    @Override
    public String buildRedisKey(String email) {
        return EMAIL_CODE_PREFIX + normalizeEmail(email);
    }

    private String generateCode() {
        int length = Math.clamp(properties.getCodeLength(), 4, 10);
        int min = (int) Math.pow(10, length - 1);
        int max = (int) Math.pow(10, length) - 1;
        return String.valueOf(ThreadLocalRandom.current().nextInt(min, max + 1));
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
