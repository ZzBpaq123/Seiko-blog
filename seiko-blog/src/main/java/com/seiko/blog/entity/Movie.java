package com.seiko.blog.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.seiko.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.math.BigDecimal;

/**
 * 电影实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("seiko_movies")
public class Movie extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 电影名称
     */
    @TableField("movie_name")
    private String movieName;

    /**
     * 是否置顶：0否 1是
     */
    @TableField("is_top")
    private Integer isTop;

    /**
     * 影片评分(如8.9)
     */
    @TableField("rating")
    private BigDecimal rating;

    /**
     * 评分来源(豆瓣)
     */
    @TableField("rating_source")
    private String ratingSource;

    /**
     * 影片标签,逗号分隔
     */
    @TableField("tags")
    private String tags;

    /**
     * 电影剧情简介
     */
    @TableField("synopsis")
    private String synopsis;

    /**
     * 横版背景大图URL
     */
    @TableField("backdrop")
    private String backdrop;

    /**
     * 影片时长(单位:分钟)
     */
    @TableField("duration")
    private Integer duration;
}
