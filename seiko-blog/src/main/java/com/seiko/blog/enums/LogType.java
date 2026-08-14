package com.seiko.blog.enums;

import com.seiko.common.enums.BaseEnum;
import lombok.Getter;

/**
 * 日志类型枚举
 */
@Getter
public enum LogType implements BaseEnum<String> {

    OPERATION("operation", "操作日志"),
    LOGIN("login", "登录日志"),
    ERROR("error", "错误日志"),
    SECURITY("security", "安全日志");

    private final String value;
    private final String description;

    LogType(String value, String description) {
        this.value = value;
        this.description = description;
    }

    public static LogType fromValue(String value) {
        for (LogType type : values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        return null;
    }
}
