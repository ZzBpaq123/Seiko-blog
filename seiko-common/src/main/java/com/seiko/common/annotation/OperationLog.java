package com.seiko.common.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 操作日志注解
 * <p>
 * 标记在 Controller 方法上，自动记录操作日志
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface OperationLog {

    /**
     * 日志类型
     *
     * @return 日志类型，默认 operation
     */
    String logType() default "operation";

    /**
     * 日志级别
     *
     * @return 日志级别，默认 INFO
     */
    String logLevel() default "INFO";

    /**
     * 操作动作
     *
     * @return 操作动作描述
     */
    String action();

    /**
     * 操作描述
     *
     * @return 操作描述，支持 SpEL 表达式
     */
    String description() default "";

    /**
     * 是否保存请求参数
     * <p>
     * 关闭后不记录请求参数，用于避免记录大体积或敏感请求体
     *
     * @return 是否保存请求参数，默认 true
     */
    boolean isSaveRequestData() default true;

    /**
     * 是否保存响应参数
     * <p>
     * 关闭后不记录接口返回结果
     *
     * @return 是否保存响应参数，默认 true
     */
    boolean isSaveResponseData() default true;

    /**
     * 排除的请求参数名
     * <p>
     * 序列化请求参数时忽略指定字段
     * （大小写敏感，匹配 JSON 字段名；密码等敏感字段默认已排除）
     *
     * @return 需要排除的参数名列表，默认空
     */
    String[] excludeParamNames() default {};
}
