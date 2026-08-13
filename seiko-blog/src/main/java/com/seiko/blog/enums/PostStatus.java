package com.seiko.blog.enums;

import com.seiko.common.enums.BaseEnum;

/**
 * 文章发布状态枚举
 */
public enum PostStatus implements BaseEnum<Boolean> {

    DRAFT(false, "草稿"),
    PUBLISHED(true, "已发布");

    private final Boolean value;
    private final String description;

    PostStatus(Boolean value, String description) {
        this.value = value;
        this.description = description;
    }

    public Boolean getValue() {
        return value;
    }

    public String getDescription() {
        return description;
    }

    public static PostStatus fromValue(Boolean value) {
        for (PostStatus status : values()) {
            if (status.value.equals(value)) {
                return status;
            }
        }
        return null;
    }
}
