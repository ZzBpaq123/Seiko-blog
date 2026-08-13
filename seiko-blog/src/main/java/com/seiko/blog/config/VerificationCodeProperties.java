package com.seiko.blog.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 邮箱验证码配置属性
 */
@Data
@ConfigurationProperties(prefix = "blog.security.email-code")
public class VerificationCodeProperties {

    /**
     * 是否启用邮箱验证码功能
     */
    private boolean enabled = true;

    /**
     * 验证码长度
     */
    private int codeLength = 6;

    /**
     * 验证码有效期（秒）
     */
    private long codeTtlSeconds = 300;

    /**
     * 同一邮箱重发冷却时间（秒）
     */
    private long resendCooldownSeconds = 60;

    /**
     * 同一 IP 每小时最大发送次数
     */
    private int ipMaxSendsPerHour = 10;

    /**
     * IP 发送超限锁定时间（秒）
     */
    private long ipLockSeconds = 3600;

    /**
     * 邮件发件人显示名称
     */
    private String senderName = "Seiko";

    /**
     * 邮件主题
     */
    private String subject = "Seiko 邮箱验证码";
}
