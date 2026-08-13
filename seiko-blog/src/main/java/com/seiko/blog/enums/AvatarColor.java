package com.seiko.blog.enums;

import com.seiko.common.enums.BaseEnum;

/**
 * 默认头像颜色常量
 */
public enum AvatarColor implements BaseEnum<String> {

    DEFAULT("#1890ff", "默认蓝色"),
    PINK("#FFB7B2", "粉色"),
    CYAN("#A0E7E5", "青色"),
    PURPLE("#C7CEEA", "紫色"),
    PEACH("#FFDAC1", "桃色"),
    MINT("#B5EAD7", "薄荷色");

    private final String value;
    private final String description;

    AvatarColor(String value, String description) {
        this.value = value;
        this.description = description;
    }

    public String getValue() {
        return value;
    }

    public String getDescription() {
        return description;
    }
}
