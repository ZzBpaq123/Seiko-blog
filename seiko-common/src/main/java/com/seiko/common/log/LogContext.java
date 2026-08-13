package com.seiko.common.log;

import lombok.Data;

/**
 * 日志上下文
 * <p>
 * 通过 ThreadLocal 存储单次请求中的日志相关信息，供拦截器和 AOP 切面共享
 */
@Data
public class LogContext {

    /**
     * IP 地址
     */
    private String ipAddress;

    /**
     * 用户代理
     */
    private String userAgent;

    /**
     * 请求方法
     */
    private String requestMethod;

    /**
     * 请求 URL
     */
    private String requestUrl;

    /**
     * 请求参数（QueryString 或 Body JSON）
     */
    private String requestParams;

    /**
     * 操作用户ID
     */
    private Long userId;

    /**
     * 操作用户名
     */
    private String username;

    private static final ThreadLocal<LogContext> CONTEXT = new ThreadLocal<>();

    /**
     * 获取当前线程的日志上下文
     */
    public static LogContext get() {
        LogContext ctx = CONTEXT.get();
        if (ctx == null) {
            ctx = new LogContext();
            CONTEXT.set(ctx);
        }
        return ctx;
    }

    /**
     * 设置当前线程的日志上下文
     */
    public static void set(LogContext ctx) {
        CONTEXT.set(ctx);
    }

    /**
     * 清除当前线程的日志上下文
     */
    public static void clear() {
        CONTEXT.remove();
    }
}
