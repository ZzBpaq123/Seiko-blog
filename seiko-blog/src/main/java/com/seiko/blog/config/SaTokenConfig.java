package com.seiko.blog.config;

import cn.dev33.satoken.context.SaHolder;
import cn.dev33.satoken.context.model.SaRequest;
import cn.dev33.satoken.filter.SaServletFilter;
import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.util.SaResult;
import com.seiko.common.result.ResultCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Sa-Token 权限认证配置
 * <p>
 * 基于 SaRouter 路由匹配实现接口权限控制：
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class SaTokenConfig {

    private final UploadConfig uploadConfig;

    /**
     * 注册 Sa-Token 全局过滤器
     */
    @Bean
    public SaServletFilter saServletFilter() {
        return new SaServletFilter()
                // 指定拦截路由
                .addInclude("/**")
                // 指定放行路由（静态资源 & Swagger & 上传文件）
                .addExclude("/favicon.ico", "/doc.html", "/webjars/**", "/swagger-resources/**", "/v3/api-docs/**",
                        "/swagger-ui/**", "/swagger-ui.html", uploadConfig.getUrlPrefix() + "/**")
                // 认证函数：基于路径和方法做权限校验
                .setAuth(obj -> {
                    SaRequest req = SaHolder.getRequest();
                    String path = req.getRequestPath();

                    // 1. 放行公开的用户接口
                    if (path.equals("/api/manage/user/login") || path.equals("/api/manage/user/register")
                            || path.equals("/api/manage/user/check")) {
                        return;
                    }

                    // 2. 放行博客的部分接口(排除新增评论)
                    if (path.startsWith("/api/blog")) {
                        return;
                    }

                    // 3. 登录用户即可访问的接口（登出、当前用户信息）
                    if (path.equals("/api/manage/user/logout") || path.equals("/api/manage/user/info")) {
                        StpUtil.checkLogin();
                        return;
                    }

                    // 4. admin 专属接口
                    if (path.startsWith("/api/manage")) {
                        StpUtil.checkLogin();
                        StpUtil.checkRole("admin");
                        return;
                    }


                    // 5. 其余接口默认需要登录
                    StpUtil.checkLogin();
                })
                // 异常处理函数
                .setError(e -> {
                    log.error("Sa-Token 异常: {}", e.getMessage());
                    return SaResult.error(e.getMessage()).setCode(ResultCode.UNAUTHORIZED.getCode());
                });
    }

}
