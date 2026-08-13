package com.seiko.common.enums;

/**
 * 通用枚举接口
 * <p>
 * 统一具有 value + description 描述的枚举行为，便于编写通用转换、校验、构造器。
 *
 * @param <T> value 的类型
 */
public interface BaseEnum<T> {

    /**
     * 枚举值
     *
     * @return 枚举值
     */
    T getValue();

    /**
     * 枚举描述
     *
     * @return 枚举描述
     */
    String getDescription();
}
