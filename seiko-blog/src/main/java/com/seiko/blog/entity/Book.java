package com.seiko.blog.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.seiko.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 书籍实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("seiko_books")
public class Book extends BaseEntity {

    private static final long serialVersionUID = 1L;

    /**
     * 书籍名称
     */
    @TableField("book_name")
    private String bookName;

    /**
     * 书籍作者
     */
    @TableField("book_author")
    private String bookAuthor;

    /**
     * 书籍封面
     */
    @TableField("book_cover")
    private String bookCover;

    /**
     * 书籍简介
     */
    @TableField("description")
    private String description;
}
