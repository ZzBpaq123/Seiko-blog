package com.seiko.blog.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.seiko.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * 评论表实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("seiko_comments")
public class Comment extends BaseEntity {

    private static final long serialVersionUID = 1L;

    /**
     * 关联用户ID
     */
    @TableField("user_email")
    private String userEmail;

    /**
     * 评论作者(冗余字段,显示用)
     */
    private String author;

    /**
     * 评论内容
     */
    @TableField("comment_content")
    private String commentContent;

    /**
     * 评论日期
     */
    @TableField("comment_date")
    private Date commentDate;

    /**
     * 头像颜色(冗余字段)
     */
    @TableField("avatar_color")
    private String avatarColor;

    /**
     * 关联文章ID(可选)
     */
    @TableField("post_id")
    private Long postId;
}
