package com.seiko.common.constant;

import java.time.Duration;

public class RedisConstant {

    /**
     * 邮件发送次数前缀
     */
    public static final String EMAIL_COOLDOWN_PREFIX = "email:send:cooldown:";

    /**
     * 邮件发送上限次数前缀
     */
    public static final String IP_COUNT_PREFIX = "email:send:count:";

    /**
     * IP 锁定前缀
     */
    public static final String EMAIL_IP_LOCK_PREFIX = "email:send:lock:";

    /**
     * 账号失败次数计数前缀
     */
    public static final String ACCOUNT_FAIL_COUNT_PREFIX = "login:fail:account:";

    /**
     * IP 失败次数计数前缀
     */
    public static final String IP_FAIL_COUNT_PREFIX = "login:fail:ip:";

    /**
     * 账号锁定前缀
     */
    public static final String ACCOUNT_LOCK_PREFIX = "login:lock:account:";

    /**
     * IP 锁定前缀
     */
    public static final String LOGIN_IP_LOCK_PREFIX = "login:lock:ip:";

    /** 缓存区名称常量，供各 Service 的缓存注解引用 */
    public static final String CACHE_BOOK = "book";
    public static final String CACHE_MOVIE = "movie";
    public static final String CACHE_FOOTPRINT = "footprint";
    public static final String CACHE_PHOTO = "photo";
    public static final String CACHE_ALBUM = "album";
    public static final String CACHE_NOTICE = "notice";
    public static final String CACHE_COMMENT = "comment";
    public static final String CACHE_RESOURCE = "resource";
    public static final String CACHE_POST = "post";
    public static final String CACHE_TAG = "tag";

    /** 默认缓存有效期：30 分钟 */
    public static final Duration DEFAULT_TTL = Duration.ofMinutes(30);

    /** 评论缓存有效期：5 分钟（评论由前台公开写入，时效性要求更高） */
    public static final Duration COMMENT_TTL = Duration.ofMinutes(5);
}
