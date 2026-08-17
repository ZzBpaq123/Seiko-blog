package com.seiko.blog.controller.manage;

import cn.dev33.satoken.stp.StpUtil;
import com.seiko.common.annotation.OperationLog;
import com.seiko.common.exception.BusinessException;
import com.seiko.common.result.Result;
import com.seiko.common.result.ResultCode;
import com.seiko.blog.component.LoginRateLimiter;
import com.seiko.blog.dto.LoginDTO;
import com.seiko.blog.dto.RegisterDTO;
import com.seiko.blog.service.UserService;
import com.seiko.blog.vo.LoginVO;
import com.seiko.blog.vo.UserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 用户控制器
 */
@Tag(name = "用户模块", description = "用户登录注册相关接口")
@RestController
@RequestMapping("/api/manage/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final LoginRateLimiter loginRateLimiter;
    private final HttpServletRequest request;

    /**
     * 用户登录
     *
     * @param loginDTO 登录信息（用户名、密码）
     * @return 登录结果
     */
    @OperationLog(logType = "login", action = "用户登录")
    @Operation(summary = "用户登录", description = "用户登录获取Token")
    @Parameters({
        @Parameter(name = "username", description = "用户名", required = true),
        @Parameter(name = "password", description = "密码", required = true)
    })
    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO loginDTO) {
        loginRateLimiter.check(request, loginDTO.getUsername());
        try {
            LoginVO loginVO = userService.login(loginDTO);
            loginRateLimiter.recordSuccess(request, loginDTO.getUsername());
            return Result.success(loginVO);
        } catch (BusinessException e) {
            if (e.getCode() != null && e.getCode().equals(ResultCode.LOGIN_ERROR.getCode())) {
                loginRateLimiter.recordFailure(request, loginDTO.getUsername());
            }
            throw e;
        }
    }

    /**
     * 用户注册
     *
     * @param registerDTO 注册信息（用户名、密码、昵称、邮箱）
     * @return 注册结果
     */
    @OperationLog(action = "用户注册")
    @Operation(summary = "用户注册", description = "新用户注册并自动登录")
    @Parameters({
        @Parameter(name = "username", description = "用户名", required = true),
        @Parameter(name = "password", description = "密码", required = true),
        @Parameter(name = "nickname", description = "昵称", required = true),
        @Parameter(name = "email", description = "邮箱")
    })
    @PostMapping("/register")
    public Result<LoginVO> register(@Valid @RequestBody RegisterDTO registerDTO) {
        LoginVO loginVO = userService.register(registerDTO);
        return Result.success("注册成功", loginVO);
    }

    /**
     * 用户登出
     */
    @OperationLog(logType = "login", action = "用户登出")
    @Operation(summary = "用户登出", description = "退出当前登录状态")
    @PostMapping("/logout")
    public Result<Void> logout() {
        userService.logout();
        return Result.success("登出成功", null);
    }

    /**
     * 获取当前用户信息
     */
    @OperationLog(action = "获取当前用户信息")
    @Operation(summary = "获取当前用户信息", description = "获取已登录用户的详细信息")
    @GetMapping("/info")
    public Result<UserVO> getCurrentUser() {
        UserVO userVO = userService.getCurrentUser();
        return Result.success(userVO);
    }

    /**
     * 检查登录状态
     */
    @OperationLog(action = "检查登录状态")
    @Operation(summary = "检查登录状态", description = "检查当前请求是否已登录")
    @GetMapping("/check")
    public Result<Boolean> isLogin() {
        boolean isLogin = StpUtil.isLogin();
        return Result.success(isLogin);
    }
}
