package com.seiko.blog.aspect;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.NullNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.seiko.common.annotation.OperationLog;
import com.seiko.common.constant.LogConstant;
import com.seiko.common.log.LogContext;
import com.seiko.common.result.Result;
import com.seiko.blog.entity.Log;
import com.seiko.blog.task.AsyncLogTask;
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
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 操作日志切面
 *
 * <p>仅拦截 {@code com.seiko.blog.controller.manage} 包下标注了 {@link OperationLog} 的方法，
 * 收集请求入参、返回参数、错误信息、操作状态与耗时，并异步入库。
 * 公开接口包 {@code controller.blog} 下的方法不记录日志。</p>
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final AsyncLogTask asyncLogTask;

    private final ObjectMapper objectMapper;

    /**
     * 切点：后台 manage 包下所有标注了 @OperationLog 的 public 方法
     */
    @Around("@annotation(com.seiko.common.annotation.OperationLog)"
            + " && within(com.seiko.blog.controller.manage..*)")
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

            // 解析日志配置
            LogConfig config = resolveConfig(operationLog);
            boolean sensitive = isSensitiveUrl(ctx.getRequestUrl());

            entity.setLogType(config.logType);
            entity.setLogLevel(config.logLevel);
            entity.setAction(config.action);
            entity.setDescription(config.description);

            // 请求信息（来自拦截器 ThreadLocal）
            entity.setIpAddress(ctx.getIpAddress());
            entity.setUserAgent(ctx.getUserAgent());
            entity.setRequestMethod(ctx.getRequestMethod());
            entity.setRequestUrl(ctx.getRequestUrl());
            entity.setMethod(buildMethodName(joinPoint));
            entity.setCostTime(costTime);

            // 请求参数：优先使用 QueryString，否则序列化方法参数
            // 登录/注册等敏感接口不记录请求参数（避免记录密码）
            if (config.saveRequestData && !sensitive) {
                String params = maskSensitiveQueryString(ctx.getRequestParams(), config.excludeParamNames);
                if (params == null || params.isEmpty()) {
                    params = buildParams(joinPoint.getArgs(), config.excludeParamNames);
                }
                entity.setRequestParams(truncate(params));
            }

            // 用户信息
            entity.setUserId(ctx.getUserId());

            // 响应信息：记录状态码、操作状态、错误信息与返回参数
            Integer responseCode = extractResponseCode(result);
            boolean failed = throwable != null;
            if (throwable != null) {
                responseCode = 500;
            } else if (result instanceof Result<?> response && !response.isSuccess()) {
                // 业务异常：接口返回了非 200 的错误 Result
                failed = true;
            }
            entity.setResponseCode(responseCode);
            entity.setStatus(failed ? LogConstant.STATUS_FAIL : LogConstant.STATUS_SUCCESS);
            if (failed) {
                entity.setLogLevel("ERROR");
                entity.setErrorMessage(truncate(extractErrorMessage(throwable, result)));
            }

            // 返回参数：登录/注册等敏感接口不记录
            if (config.saveResponseData && !sensitive) {
                entity.setJsonResult(truncate(toJson(result)));
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
    private LogConfig resolveConfig(OperationLog operationLog) {
        LogConfig config = new LogConfig();
        config.logType = operationLog.logType();
        config.logLevel = operationLog.logLevel();
        config.action = operationLog.action();
        config.description = operationLog.description();
        config.saveRequestData = operationLog.isSaveRequestData();
        config.saveResponseData = operationLog.isSaveResponseData();
        config.excludeParamNames = operationLog.excludeParamNames();
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
     * 提取错误信息：优先取异常信息，其次取错误 Result 的 message
     */
    private String extractErrorMessage(Throwable throwable, Object result) {
        if (throwable != null) {
            return throwable.getMessage();
        }
        if (result instanceof Result<?> response) {
            return response.getMessage();
        }
        return null;
    }

    /**
     * 构建方法名称（类全限定名.方法名）
     */
    private String buildMethodName(ProceedingJoinPoint joinPoint) {
        String className = joinPoint.getTarget().getClass().getName();
        String methodName = joinPoint.getSignature().getName();
        return className + "." + methodName + "()";
    }

    /**
     * 将方法参数序列化为 JSON 字符串
     *
     * <p>过滤掉 Spring 内部对象，只保留业务参数：</p>
     * <ul>
     *   <li>单个参数：直接序列化该对象，不包数组</li>
     *   <li>多个参数：过滤后序列化为数组</li>
     * </ul>
     *
     * <p>序列化时排除敏感字段（默认密码类字段 + 注解 {@code excludeParamNames} 指定的字段）。</p>
     */
    private String buildParams(Object[] args, String[] excludeParamNames) {
        if (args == null || args.length == 0) {
            return null;
        }

        // 过滤掉 Spring 内部对象（HttpServletRequest、BindingResult、MultipartFile 等）
        List<Object> validArgs = new ArrayList<>();
        for (Object arg : args) {
            if (arg == null || isFilterObject(arg)) {
                continue;
            }
            validArgs.add(arg);
        }

        if (validArgs.isEmpty()) {
            return null;
        }

        try {
            // 单个参数直接序列化对象本身，避免外层包一层数组
            Object payload = validArgs.size() == 1 ? validArgs.getFirst() : validArgs;
            return toJsonWithExcludes(payload, excludeParamNames);
        } catch (Exception e) {
            log.warn("请求参数序列化失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 判断对象是否为需要过滤的 Spring 内部对象
     */
    private boolean isFilterObject(Object obj) {
        Class<?> clazz = obj.getClass();
        if (clazz.isArray()) {
            return MultipartFile.class.isAssignableFrom(clazz.getComponentType());
        }
        return MultipartFile.class.isAssignableFrom(clazz)
                || HttpServletRequest.class.isAssignableFrom(clazz)
                || HttpServletResponse.class.isAssignableFrom(clazz)
                || BindingResult.class.isAssignableFrom(clazz);
    }

    /**
     * 序列化为 JSON 并排除敏感字段
     */
    private String toJsonWithExcludes(Object value, String[] excludeParamNames) {
        if (value == null) {
            return null;
        }
        try {
            Set<String> excludes = buildExcludes(excludeParamNames);
            JsonNode node = objectMapper.valueToTree(value);
            return objectMapper.writeValueAsString(filterSensitive(node, excludes));
        } catch (Exception e) {
            log.warn("参数序列化失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 序列化返回参数
     */
    private String toJson(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            log.warn("返回参数序列化失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 拼接默认敏感字段与注解自定义排除字段
     */
    private Set<String> buildExcludes(String[] extra) {
        Set<String> excludes = new HashSet<>(Arrays.asList(LogConstant.DEFAULT_EXCLUDE_PARAMS));
        if (extra != null) {
            excludes.addAll(Arrays.asList(extra));
        }
        return excludes;
    }

    /**
     * 递归过滤 JSON 树中的敏感字段
     */
    private JsonNode filterSensitive(JsonNode node, Set<String> excludes) {
        if (node == null || node.isNull()) {
            return NullNode.getInstance();
        }
        if (node.isObject()) {
            ObjectNode filtered = objectMapper.createObjectNode();
            node.fields().forEachRemaining(entry -> {
                if (!excludes.contains(entry.getKey())) {
                    filtered.set(entry.getKey(), filterSensitive(entry.getValue(), excludes));
                }
            });
            return filtered;
        }
        if (node.isArray()) {
            ArrayNode filtered = objectMapper.createArrayNode();
            node.forEach(item -> filtered.add(filterSensitive(item, excludes)));
            return filtered;
        }
        return node;
    }

    /**
     * 对 QueryString 中的敏感参数值打码（如 password=123 -> password=******）
     */
    private String maskSensitiveQueryString(String queryString, String[] excludeParamNames) {
        if (queryString == null || queryString.isEmpty()) {
            return null;
        }
        Set<String> excludes = buildExcludes(excludeParamNames);
        String[] pairs = queryString.split("&");
        StringBuilder masked = new StringBuilder();
        for (String pair : pairs) {
            if (!masked.isEmpty()) {
                masked.append('&');
            }
            int idx = pair.indexOf('=');
            String key = idx > 0 ? pair.substring(0, idx) : pair;
            if (excludes.contains(key)) {
                masked.append(key).append('=').append(LogConstant.MASK);
            } else {
                masked.append(pair);
            }
        }
        return masked.toString();
    }

    /**
     * 判断是否为敏感接口（不记录请求/返回参数）
     */
    private boolean isSensitiveUrl(String url) {
        if (url == null) {
            return false;
        }
        return url.contains("/login") || url.contains("/register");
    }

    /**
     * 截断超长字段，避免日志表存储过大数据
     */
    private String truncate(String value) {
        if (value == null || value.length() <= LogConstant.MAX_LOG_LENGTH) {
            return value;
        }
        return value.substring(0, LogConstant.MAX_LOG_LENGTH);
    }

    /**
     * 日志配置内部类
     */
    private static class LogConfig {
        String logType = "operation";
        String logLevel = "INFO";
        String action = "";
        String description = "";
        boolean saveRequestData = true;
        boolean saveResponseData = true;
        String[] excludeParamNames = new String[0];
    }
}
