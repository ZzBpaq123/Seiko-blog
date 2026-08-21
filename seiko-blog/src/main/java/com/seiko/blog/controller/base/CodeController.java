package com.seiko.blog.controller.base;

import com.seiko.common.result.Result;
import com.seiko.blog.component.EmailRateLimiter;
import com.seiko.blog.config.VerificationCodeProperties;
import com.seiko.blog.dto.EmailCodeSendDTO;
import com.seiko.blog.service.VerificationCodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 验证码控制器
 */
@Tag(name = "验证码模块", description = "验证码管理相关接口")
@RestController
@RequestMapping("/api/blog/code")
@RequiredArgsConstructor
public class CodeController {

    private final VerificationCodeService verificationCodeService;
    private final EmailRateLimiter emailRateLimiter;
    private final VerificationCodeProperties verificationCodeProperties;
    private final HttpServletRequest request;

    /**
     * 发送邮箱验证码
     */
    @PostMapping("/email/code")
    @Operation(summary = "发送邮箱验证码", description = "向指定邮箱发送 6 位数字验证码")
    public Result<Void> sendEmailCode(@Valid @RequestBody EmailCodeSendDTO dto) {
        if (!verificationCodeProperties.isEnabled()) {
            return Result.success(null);
        }

        emailRateLimiter.check(request, dto.getEmail());
        verificationCodeService.generateAndSend(dto.getEmail());
        emailRateLimiter.recordSend(request, dto.getEmail());

        return Result.success("验证码已发送", null);
    }
}
