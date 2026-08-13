package com.seiko.blog.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.seiko.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * 相册表实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("seiko_photos")
public class Photo extends BaseEntity {

    private static final long serialVersionUID = 1L;

    /**
     * 相册表ID
     */
    @TableField("album_id")
    private Long albumId;

    /**
     * 图片URL地址
     */
    @TableField("photo_src")
    private String photoSrc;

    /**
     * 图片替代文本
     */
    @TableField("photo_alt")
    private String photoAlt;

    /**
     * 图片宽度(px)
     */
    @TableField("photo_width")
    private Integer photoWidth;

    /**
     * 图片高度(px)
     */
    @TableField("photo_height")
    private Integer photoHeight;

    /**
     * 图片标题
     */
    @TableField("photo_title")
    private String photoTitle;

    /**
     * 拍摄地点
     */
    @TableField("photo_location")
    private String photoLocation;

    /**
     * 拍摄日期
     */
    @TableField("photo_date")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date photoDate;

    /**
     * 排序序号
     */
    @TableField("sort_order")
    private Integer sortOrder;
}
