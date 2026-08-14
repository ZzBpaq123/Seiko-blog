package com.seiko.blog.aspect;

import cn.hutool.json.JSONUtil;
import com.seiko.common.annotation.OperationLog;
import com.seiko.common.result.Result;
import com.seiko.blog.entity.Log;
import com.seiko.common.log.LogContext;
import com.seiko.blog.task.AsyncLogTask;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.validation.BindingResult;
import org.springframework.web.multipart.MultipartFile;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

/**
 * 操作日志切面
 *
 * <p>自动拦截所有 {@link org.springframework.web.bind.annotation.RestController} 下的方法，
 * 收集执行信息并异步入库。</p>
 *
 * <p>优先级：</p>
 * <ol>
 *   <li>方法上的 {@link OperationLog} 注解（如有则优先使用）</li>
 *   <li>Swagger 的 {@link Operation} 注解 summary</li>
 *   <li>默认：类名.方法名</li>
 * </ol>
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final AsyncLogTask asyncLogTask;

    /**
     * 切点：所有被 @RestController 标记的类下的所有 public 方法
     */
    @Around("@within(org.springframework.web.bind.annotation.RestController)")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result = null;
        Throwable throwable = null;

        try {
            result = joinPoint.proceed();
            return result;
        } catch (Throwable e) {
            throwable = e;
            throw e;
        } finally {
            long costTime = System.currentTimeMillis() - startTime;
            saveLog(joinPoint, result, throwable, costTime);
        }
    }

    /**
     * 组装并保存日志
     */
    private void saveLog(ProceedingJoinPoint joinPoint, Object result, Throwable throwable, long costTime) {
        try {
            LogContext ctx = LogContext.get();
            Log entity = new Log();

            // 获取方法上的注解信息
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            OperationLog operationLog = method.getAnnotation(OperationLog.class);
            Operation swaggerOperation = method.getAnnotation(Operation.class);

            // 解析日志配置
            LogConfig config = resolveConfig(operationLog, swaggerOperation, joinPoint);
            entity.setLogType(config.logType);
            entity.setLogLevel(config.logLevel);
            entity.setAction(config.action);
            entity.setDescription(config.description);

            // 请求信息（来自拦截器 ThreadLocal）
            entity.setIpAddress(ctx.getIpAddress());
            entity.setUserAgent(ctx.getUserAgent());
            entity.setRequestMethod(ctx.getRequestMethod());
            entity.setRequestUrl(ctx.getRequestUrl());

            // 请求参数：优先使用 QueryString，否则序列化方法参数
            // 登录/注册等敏感接口不记录请求参数（避免记录密码）
            String params = ctx.getRequestParams();
            if (!isSensitiveUrl(ctx.getRequestUrl()) && (params == null || params.isEmpty())) {
                params = buildParams(joinPoint.getArgs());
            }
            entity.setRequestParams(params);

            // 用户信息
            entity.setUserId(ctx.getUserId());

            // 响应信息
            if (throwable != null) {
                entity.setLogLevel("ERROR");
                entity.setResponseCode(500);
                entity.setErrorMessage(throwable.getMessage());
            } else {
                entity.setResponseCode(extractResponseCode(result));
            }

            // 异步保存日志
            asyncLogTask.saveLog(entity);
        } catch (Exception e) {
            log.error("保存操作日志失败", e);
        }
    }

    /**
     * 解析日志配置
     */
    private LogConfig resolveConfig(OperationLog operationLog, Operation swaggerOperation,
                                    ProceedingJoinPoint joinPoint) {
        LogConfig config = new LogConfig();

        if (operationLog != null) {
            // 优先使用 @OperationLog 注解配置
            config.logType = operationLog.logType();
            config.logLevel = operationLog.logLevel();
            config.action = operationLog.action();
            config.description = operationLog.description();
            return config;
        }

        // 自动推断配置
        String requestUrl = LogContext.get().getRequestUrl();

        // logType：根据 URL 自动推断
        if (requestUrl != null && requestUrl.contains("/login")) {
            config.logType = "login";
        } else {
            config.logType = "operation";
        }

        config.logLevel = "INFO";

        // action：优先使用 Swagger @Operation 的 summary
        if (swaggerOperation != null && !swaggerOperation.summary().isEmpty()) {
            config.action = swaggerOperation.summary();
        } else {
            // 降级：类名.方法名
            String className = joinPoint.getTarget().getClass().getSimpleName()
                    .replace("Controller", "");
            String methodName = joinPoint.getSignature().getName();
            config.action = className + "." + methodName;
        }

        // description：使用 Swagger @Operation 的 description
        if (swaggerOperation != null) {
            config.description = swaggerOperation.description();
        }

        return config;
    }

    /**
     * 提取响应状态码
     */
    private Integer extractResponseCode(Object result) {
        if (result instanceof Result<?>) {
            return ((Result<?>) result).getCode();
        }
        return 200;
    }

    /**
     * 将方法参数序列化为 JSON 字符串
     *
     * <p>过滤掉 Spring 内部对象，只保留业务参数：</p>
     * <ul>
     *   <li>单个参数：直接序列化该对象，不包数组</li>
     *   <li>多个参数：过滤后序列化为数组</li>
     * </ul>
     */
    private String buildParams(Object[] args) {
        if (args == null || args.length == 0) {
            return null;
        }

        // 过滤掉 Spring 内部对象（HttpServletRequest、BindingResult、MultipartFile 等）
        List<Object> validArgs = new ArrayList<>();
        for (Object arg : args) {
            if (arg == null) {
                continue;
            }
            if (arg instanceof HttpServletRequest
                    || arg instanceof HttpServletResponse
                    || arg instanceof BindingResult
                    || arg instanceof MultipartFile
                    || arg instanceof MultipartFile[]) {
                continue;
            }
            validArgs.add(arg);
        }

        if (validArgs.isEmpty()) {
            return null;
        }

        try {
            // 单个参数直接序列化对象本身，避免外层包一层数组
            if (validArgs.size() == 1) {
                return JSONUtil.toJsonStr(validArgs.getFirst());
            }
            // 多个参数序列化为数组
            return JSONUtil.toJsonStr(validArgs);
        } catch (Exception e) {
            log.warn("请求参数序列化失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 判断是否为敏感接口（不记录请求参数）
     */
    private boolean isSensitiveUrl(String url) {
        if (url == null) {
            return false;
        }
        return url.contains("/login") || url.contains("/register");
    }

    /**
     * 日志配置内部类
     */
    private static class LogConfig {
        String logType = "operation";
        String logLevel = "INFO";
        String action = "";
        String description = "";
    }
}
