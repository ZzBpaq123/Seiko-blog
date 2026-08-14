package com.seiko.blog.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.seiko.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * 日志表实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("seiko_logs")
public class Log extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 日志类型: operation-操作日志, login-登录日志, error-错误日志, security-安全日志
     */
    @TableField("log_type")
    private String logType;

    /**
     * 日志级别: DEBUG-调试, INFO-信息, WARN-警告, ERROR-错误
     */
    @TableField("log_level")
    private String logLevel;

    /**
     * 操作动作
     */
    @TableField("`action`")
    private String action;

    /**
     * 操作描述
     */
    private String description;

    /**
     * 操作用户ID
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 操作用户名(冗余字段)
     */
    private String username;

    /**
     * IP地址
     */
    @TableField("ip_address")
    private String ipAddress;

    /**
     * 用户代理
     */
    @TableField("user_agent")
    private String userAgent;

    /**
     * 请求方法
     */
    @TableField("request_method")
    private String requestMethod;

    /**
     * 请求URL
     */
    @TableField("request_url")
    private String requestUrl;

    /**
     * 请求参数(JSON)
     */
    @TableField("request_params")
    private String requestParams;

    /**
     * 响应状态码
     */
    @TableField("response_code")
    private Integer responseCode;

    /**
     * 错误信息
     */
    @TableField("error_message")
    private String errorMessage;
}
