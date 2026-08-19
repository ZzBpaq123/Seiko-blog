package com.seiko.blog.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.seiko.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * 字典类型表实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("seiko_dict_types")
public class DictType extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 字典类型编码，如 common_status
     */
    @TableField("type_code")
    private String typeCode;

    /**
     * 字典类型名称，如 通用状态
     */
    @TableField("type_name")
    private String typeName;

    /**
     * 备注
     */
    private String remark;

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
