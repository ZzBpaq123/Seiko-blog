package com.seiko.blog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Date;

/**
 * 评论DTO
 */
@Data
@Schema(description = "评论创建请求")
public class CommentDTO {

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    @Schema(description = "用户邮箱")
    private String userEmail;

    @NotBlank(message = "验证码不能为空")
    @Size(min = 6, max = 6, message = "验证码长度必须为6位")
    private String code;

    @NotBlank(message = "评论作者不能为空")
    @Schema(description = "评论作者")
    private String author;

    @NotBlank(message = "评论内容不能为空")
    @Schema(description = "评论内容")
    private String commentContent;

    @NotNull(message = "评论日期不能为空")
    @Schema(description = "评论日期")
    private Date commentDate;

    @Schema(description = "头像颜色")
    private String avatarColor;

    @Schema(description = "关联文章ID")
    private Long postId;
}
