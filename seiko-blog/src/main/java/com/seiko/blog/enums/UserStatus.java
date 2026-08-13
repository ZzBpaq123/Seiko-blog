package com.seiko.blog.enums;

import com.seiko.common.enums.BaseEnum;

/**
 * 用户状态枚举
 */
public enum UserStatus implements BaseEnum<String> {

    ACTIVE("active", "激活"),
    INACTIVE("inactive", "禁用");

    private final String value;
    private final String description;

    UserStatus(String value, String description) {
        this.value = value;
        this.description = description;
    }

    public String getValue() {
        return value;
    }

    public String getDescription() {
        return description;
    }

    public static UserStatus fromValue(String value) {
        for (UserStatus status : values()) {
            if (status.value.equals(value)) {
                return status;
            }
        }
        return null;
    }
}
