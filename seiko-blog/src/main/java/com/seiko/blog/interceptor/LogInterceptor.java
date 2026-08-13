package com.seiko.blog.interceptor;

import cn.dev33.satoken.stp.StpUtil;
import com.seiko.common.log.LogContext;
import com.seiko.common.util.IpUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 日志拦截器
 * <p>
 * 在请求进入 Controller 前收集请求信息（IP、UA、请求参数等）存入 ThreadLocal
 */
@Slf4j
@Component
public class LogInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        LogContext ctx = LogContext.get();

        // 收集请求信息
        ctx.setIpAddress(IpUtils.getClientIp(request));
        ctx.setUserAgent(request.getHeader("User-Agent"));
        ctx.setRequestMethod(request.getMethod());
        ctx.setRequestUrl(request.getRequestURI());
        ctx.setRequestParams(request.getQueryString());

        // 收集当前用户ID（用户名在异步任务中通过 userId 查询）
        try {
            if (StpUtil.isLogin()) {
                ctx.setUserId(StpUtil.getLoginIdAsLong());
            }
        } catch (Exception e) {
            // 未登录，忽略
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // 请求结束后清除 ThreadLocal，防止内存泄漏
        LogContext.clear();
    }

}
