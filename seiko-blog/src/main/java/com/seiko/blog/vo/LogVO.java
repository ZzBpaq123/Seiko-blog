package com.seiko.blog.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Date;

/**
 * 日志VO
 */
@Data
@Schema(description = "日志信息")
public class LogVO {

    @Schema(description = "日志ID")
    private Long id;

    @Schema(description = "日志类型")
    private String logType;

    @Schema(description = "日志级别")
    private String logLevel;

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

    @Schema(description = "请求URL")
    private String requestUrl;

    @Schema(description = "请求参数(JSON)")
    private String requestParams;

    @Schema(description = "响应状态码")
    private Integer responseCode;

    @Schema(description = "错误信息")
    private String errorMessage;

    @Schema(description = "创建时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;
}
