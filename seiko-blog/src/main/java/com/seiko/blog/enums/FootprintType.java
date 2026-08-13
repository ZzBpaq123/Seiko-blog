package com.seiko.blog.enums;

import com.seiko.common.enums.BaseEnum;

/**
 * 足迹类型枚举
 */
public enum FootprintType implements BaseEnum<String> {

    DOMESTIC("domestic", "国内"),
    INTERNATIONAL("international", "国际");

    private final String value;
    private final String description;

    FootprintType(String value, String description) {
        this.value = value;
        this.description = description;
    }

    public String getValue() {
        return value;
    }

    public String getDescription() {
        return description;
    }

    public static FootprintType fromValue(String value) {
        for (FootprintType type : values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        return null;
    }

    public static boolean isValid(String value) {
        return fromValue(value) != null;
    }
}
