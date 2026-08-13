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
}
