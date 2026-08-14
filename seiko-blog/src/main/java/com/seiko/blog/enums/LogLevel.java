package com.seiko.blog.enums;

import com.seiko.common.enums.BaseEnum;
import lombok.Getter;

/**
 * 日志级别枚举
 */
@Getter
public enum LogLevel implements BaseEnum<String> {

    DEBUG("DEBUG", "调试"),
    INFO("INFO", "信息"),
    WARN("WARN", "警告"),
    ERROR("ERROR", "错误");

    private final String value;
    private final String description;

    LogLevel(String value, String description) {
        this.value = value;
        this.description = description;
    }

    public static LogLevel fromValue(String value) {
        for (LogLevel level : values()) {
            if (level.value.equals(value)) {
                return level;
            }
        }
        return null;
    }
}
