package com.seiko.blog.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 登录速率限制配置属性
 */
@Data
@ConfigurationProperties(prefix = "blog.security.login-rate-limit")
public class LoginRateLimitProperties {

    /**
     * 是否启用登录速率限制，默认启用
     */
    private boolean enabled = true;

    /**
     * 单个账号在窗口期内允许的最大失败次数，默认 5 次
     */
    private int maxAttempts = 3;

    /**
     * 单个 IP 在窗口期内允许的最大失败次数，默认 10 次
     */
    private int ipMaxAttempts = 5;

    /**
     * 计数窗口时长，单位秒，默认 300 秒（5 分钟）
     */
    private long windowSeconds = 300;

    /**
     * 触发限制后的锁定时长，单位秒，默认 900 秒（15 分钟）
     */
    private long lockSeconds = 900;

}
