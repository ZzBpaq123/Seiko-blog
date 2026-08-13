package com.seiko.blog.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.seiko.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 标签表实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("seiko_tags")
public class Tag extends BaseEntity {

    private static final long serialVersionUID = 1L;

    /**
     * 标签名称
     */
    private String name;

    /**
     * URL友好标识
     */
    private String slug;
}
