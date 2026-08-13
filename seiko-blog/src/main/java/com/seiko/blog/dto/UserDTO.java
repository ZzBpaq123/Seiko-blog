package com.seiko.blog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 用户管理DTO（后台创建/更新用户）
 */
@Data
@Schema(description = "用户创建/更新请求")
public class UserDTO {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度在3-20之间")
    @Schema(description = "用户名")
    private String username;

    @Size(min = 6, max = 20, message = "密码长度在6-20之间")
    @Schema(description = "密码（创建时必填，更新时留空表示不修改）")
    private String password;

    @NotBlank(message = "昵称不能为空")
    @Schema(description = "昵称")
    private String nickname;

    @Email(message = "邮箱格式不正确")
    @Schema(description = "邮箱")
    private String email;

    @Schema(description = "头像URL")
    private String avatar;

    @Schema(description = "头像背景色")
    private String avatarColor;

    @Schema(description = "个人简介")
    private String bio;

    @Schema(description = "个人网站")
    private String website;

    @Schema(description = "用户角色: admin-管理员, user-普通用户")
    private String userRole;

    @Schema(description = "用户状态: active-激活, inactive-禁用")
    private String userStatus;
}
