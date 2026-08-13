package com.seiko.blog.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 登录响应VO
 */
@Data
@Schema(description = "登录响应")
public class LoginVO {

    @Schema(description = "访问Token")
    private String token;

    @Schema(description = "Token类型")
    private String tokenType = "Bearer";

    @Schema(description = "用户信息")
    private UserVO user;
}
