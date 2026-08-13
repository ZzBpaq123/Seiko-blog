package com.seiko.common.result;

import lombok.Getter;

/**
 * 响应状态码枚举
 */
@Getter
public enum ResultCode {

    /**
     * 成功
     */
    SUCCESS(200, "操作成功"),

    /**
     * 失败
     */
    ERROR(500, "操作失败"),

    /**
     * 参数错误
     */
    PARAM_ERROR(400, "参数错误"),

    /**
     * 未授权
     */
    UNAUTHORIZED(401, "未授权，请先登录"),

    /**
     * 禁止访问
     */
    FORBIDDEN(403, "禁止访问"),

    /**
     * 资源不存在
     */
    NOT_FOUND(404, "资源不存在"),

    /**
     * 请求方式错误
     */
    METHOD_NOT_ALLOWED(405, "请求方式错误"),

    /**
     * 资源冲突
     */
    CONFLICT(409, "资源冲突"),

    /**
     * 请求过于频繁
     */
    TOO_MANY_REQUESTS(429, "请求过于频繁"),

    /**
     * 用户名或密码错误
     */
    LOGIN_ERROR(1001, "用户名或密码错误"),

    /**
     * Token 无效或已过期
     */
    TOKEN_INVALID(1002, "登录已过期，请重新登录"),

    /**
     * 用户已被禁用
     */
    USER_DISABLED(1003, "用户已被禁用"),

    /**
     * 用户名已存在
     */
    USERNAME_EXISTS(1004, "用户名已存在"),

    /**
     * 旧密码错误
     */
    OLD_PASSWORD_ERROR(1005, "原密码错误"),

    /**
     * 验证码发送失败
     */
    VERIFICATION_CODE_SEND_FAILED(1006, "验证码发送失败，请稍后重试"),

    /**
     * 验证码错误或已过期
     */
    VERIFICATION_CODE_ERROR(1007, "验证码错误或已过期"),

    /**
     * 验证码发送过于频繁
     */
    VERIFICATION_CODE_TOO_FREQUENT(1008, "验证码发送过于频繁，请稍后再试"),

    /**
     * 文件上传失败
     */
    FILE_UPLOAD_ERROR(2001, "文件上传失败"),

    /**
     * 文件类型不允许
     */
    FILE_TYPE_NOT_ALLOWED(2002, "文件类型不允许"),

    /**
     * 文件大小超过限制
     */
    FILE_SIZE_EXCEEDED(2003, "文件大小超过限制");

    private final Integer code;
    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

}
