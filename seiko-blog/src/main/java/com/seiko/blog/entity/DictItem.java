package com.seiko.blog.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.seiko.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * 字典项表实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("seiko_dict_items")
public class DictItem extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 所属字典类型编码（冗余存储，查询免 JOIN）
     */
    @TableField("type_code")
    private String typeCode;

    /**
     * 展示文案，如 开启
     */
    @TableField("item_label")
    private String itemLabel;

    /**
     * 存储值，如 0
     */
    @TableField("item_value")
    private String itemValue;

    /**
     * 标签样式: green/red/yellow/blue/gray
     */
    @TableField("item_tag")
    private String itemTag;

    /**
     * 是否默认项: 0-否 1-是
     */
    @TableField("is_default")
    private Boolean isDefault;

    /**
     * 是否启用: 0-停用 1-启用
     */
    private Boolean enabled;

    /**
     * 排序
     */
    @TableField("sort_order")
    private Integer sortOrder;
}
