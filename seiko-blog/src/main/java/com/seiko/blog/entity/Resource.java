package com.seiko.blog.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.seiko.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * 资源目录表实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("seiko_resources")
public class Resource extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 资源名称
     */
    @TableField("resource_name")
    private String resourceName;

    /**
     * 资源网址
     */
    @TableField("resource_url")
    private String resourceUrl;

    /**
     * 资源分类(如:开发工具/设计资源/学习)
     */
    @TableField("category")
    private String category;

    /**
     * 资源简介
     */
    @TableField("description")
    private String description;

    /**
     * 排序序号(越小越靠前)
     */
    @TableField("sort_order")
    private Integer sortOrder;

    /**
     * 是否启用: 0-禁用 1-启用
     */
    @TableField("is_enabled")
    private Boolean enabled;
}
