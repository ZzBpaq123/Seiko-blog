package com.seiko.blog.enums;

import com.seiko.common.enums.BaseEnum;

/**
 * 用户角色枚举
 */
public enum UserRole implements BaseEnum<String> {

    ADMIN("admin", "管理员"),
    USER("user", "普通用户");

    private final String value;
    private final String description;

    UserRole(String value, String description) {
        this.value = value;
        this.description = description;
    }

    public String getValue() {
        return value;
    }

    public String getDescription() {
        return description;
    }

    public static UserRole fromValue(String value) {
        for (UserRole role : values()) {
            if (role.value.equals(value)) {
                return role;
            }
        }
        return null;
    }
}
