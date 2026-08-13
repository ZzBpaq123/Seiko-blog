package com.seiko.blog.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Date;

/**
 * 评论VO
 */
@Data
@Schema(description = "评论信息")
public class CommentVO {

    @Schema(description = "评论ID")
    private Long id;

    @Schema(description = "用户邮箱")
    private String userEmail;

    @Schema(description = "评论作者")
    private String author;

    @Schema(description = "评论内容")
    private String commentContent;

    @Schema(description = "评论日期")
    private Date commentDate;

    @Schema(description = "头像颜色")
    private String avatarColor;

    @Schema(description = "关联文章ID")
    private Long postId;

    @Schema(description = "创建时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;
}
