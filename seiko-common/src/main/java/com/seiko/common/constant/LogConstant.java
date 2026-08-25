package com.seiko.common.constant;

/**
 * 日志常量
 */
public class LogConstant {

    /**
     * 操作状态：正常
     */
    public static final int STATUS_SUCCESS = 0;

    /**
     * 操作状态：异常
     */
    public static final int STATUS_FAIL = 1;

    /**
     * 默认排除的敏感字段
     */
    public static final String[] DEFAULT_EXCLUDE_PARAMS = {
            "password", "oldPassword", "newPassword", "confirmPassword",
            "accessToken", "refreshToken", "token", "secret"
    };

    /**
     * 日志字段最大保存长度
     */
    public static final int MAX_LOG_LENGTH = 2000;

    /**
     * 默认的敏感字段掩码
     */
    public static final String MASK = "******";
}
