package com.seiko.blog.component;

import com.seiko.blog.config.VerificationCodeProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.boot.autoconfigure.mail.MailProperties;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * 邮件发送服务
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final VerificationCodeProperties properties;
    private final MailProperties mailProperties;

    /**
     * 异步发送验证码邮件，发送失败仅记录日志，不影响调用方响应
     */
    @Async("mailExecutor")
    public void sendVerificationCode(String email, String code) {
        if (!properties.isEnabled()) {
            return;
        }

        try {
            String mailUsername = mailProperties.getUsername();
            if (mailUsername == null || mailUsername.isBlank()) {
                log.warn("未配置 spring.mail.username，跳过验证码邮件发送");
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("Seiko <" + mailUsername + ">");
            helper.setTo(email);
            helper.setSubject(properties.getSubject());
            helper.setText(buildContent(code), true);

            mailSender.send(message);
            log.info("验证码邮件已发送至 [{}]", email);
        } catch (MailException | MessagingException e) {
            log.error("验证码邮件发送失败: {}", e.getMessage(), e);
        }
    }

    private String buildContent(String code) {
        // 有效时长 分钟
        long validMinute = properties.getCodeTtlSeconds() / 60;
        return "<html>" +
                "<head>" +
                "<meta charset=\"UTF-8\">" +
                "</head>" +
                "<body style=\"font-family: Microsoft YaHei, Arial, sans-serif; font-size: 15px; color: #333; line-height: 1.7; margin: 0; padding: 0;\">" +
                "<div style=\"max-width: 520px; margin: 0 auto; padding: 20px;\">" +
                "<p style=\"margin: 0 0 15px 0;\">您正在使用[Seiko]旗下相关产品，本次操作的验证码如下：</p>" +

                // 验证码盒子：灰色背景
                "<div style=\"background-color: #f5f7fa; padding: 12px 20px; margin: 15px 0;\">" +
                "<span style=\"font-size: 26px; font-weight: bold; color: #1677ff; letter-spacing: 4px;\">" + code + "</span>" +
                "</div>" +

                "<p style=\"margin: 15px 0 0 0;\">验证码有效期：<strong>" + validMinute + " 分钟</strong>，切勿将验证码转发、泄露给任何人。</p>" +

                // 底部提示分割+灰色小字
                "<div style=\"color: #888; font-size: 14px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;\">" +
                "若并非您本人发起操作，请直接忽略此邮件，账号不会受到影响。" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}
