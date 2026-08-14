package com.seiko.blog.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.seiko.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.util.Date;

/**
 * 相册表实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("seiko_album")
public class Album extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 相册名称
     */
    @TableField("album_name")
    private String albumName;

    /**
     * 相册简介描述
     */
    @TableField("album_desc")
    private String albumDesc;

    /**
     * 相册封面图URL
     */
    @TableField("album_cover")
    private String albumCover;

    /**
     * 相册所属时间
     */
    @TableField("album_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date albumTime;
}
