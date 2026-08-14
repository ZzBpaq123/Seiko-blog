package com.seiko.blog.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.seiko.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * 公告表实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("seiko_notice")
public class Notice extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableField("notice_icon")
    private String noticeIcon;

    /**
     * 公告标题
     */
    @TableField("notice_title")
    private String noticeTitle;

    /**
     * 公告内容
     */
    @TableField("notice_content")
    private String noticeContent;

    /**
     * 跳转链接
     */
    @TableField("notice_link")
    private String noticeLink;

    /**
     * 排序序号
     */
    @TableField("sort_order")
    private Integer sortOrder;

    /**
     * 是否启用: 0-禁用 1-启用
     */
    @TableField("is_enabled")
    private Boolean enabled;
}
