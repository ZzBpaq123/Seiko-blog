package com.seiko.blog.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.seiko.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * 文章表实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("seiko_posts")
public class Post extends BaseEntity {

    private static final long serialVersionUID = 1L;

    /**
     * URL友好标识
     */
    private String slug;

    /**
     * 文章标题
     */
    private String title;

    /**
     * 文章摘要
     */
    private String excerpt;

    /**
     * 文章内容(Markdown)
     */
    private String content;

    /**
     * 封面图路径
     */
    private String cover;

    /**
     * 作者
     */
    private String author;

    /**
     * 阅读次数
     */
    @TableField("read_num")
    private Integer readNum;

    /**
     * 是否发布: 0-草稿 1-已发布
     */
    @TableField("is_published")
    private Boolean published;

    /**
     * 发布时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date publishTime;
}
