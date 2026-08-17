package com.seiko.blog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 日志DTO
 */
@Data
@Schema(description = "日志创建请求")
public class LogDTO {

    @NotBlank(message = "日志类型不能为空")
    @Schema(description = "日志类型: operation-操作日志, login-登录日志, error-错误日志, security-安全日志")
    private String logType;

    @NotBlank(message = "日志级别不能为空")
    @Schema(description = "日志级别: DEBUG-调试, INFO-信息, WARN-警告, ERROR-错误")
    private String logLevel;

    @NotBlank(message = "操作动作不能为空")
    @Schema(description = "操作动作")
    private String action;

    @Schema(description = "操作描述")
    private String description;

    @Schema(description = "操作用户ID")
    private Long userId;

    @Schema(description = "操作用户名")
    private String username;

    @Schema(description = "IP地址")
    private String ipAddress;

    @Schema(description = "用户代理")
    private String userAgent;

    @Schema(description = "请求方法")
    private String requestMethod;

    @Schema(description = "方法名称(类全限定名.方法名)")
    private String method;

    @Schema(description = "请求URL")
    private String requestUrl;

    @Schema(description = "请求参数(JSON)")
    private String requestParams;

    @Schema(description = "返回参数(JSON)")
    private String jsonResult;

    @Schema(description = "响应状态码")
    private Integer responseCode;

    @Schema(description = "操作状态: 0-正常 1-异常")
    private Integer status;

    @Schema(description = "消耗时间(毫秒)")
    private Long costTime;

    @Schema(description = "错误信息")
    private String errorMessage;
}
