package com.seiko.blog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 忘记密码-查询邮箱请求
 */
@Data
@Schema(description = "忘记密码-根据用户名查询掩码邮箱")
public class ForgotPasswordEmailDTO {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度在3-20之间")
    @Schema(description = "用户名")
    private String username;
}
