package com.seiko.blog.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * 启动时打印核心配置信息
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StartupConfigPrinter implements ApplicationRunner {

    private final Environment env;

    @Override
    public void run(ApplicationArguments args) {
        List<ConfigItem> items = new ArrayList<>();

        // 应用基础信息
        items.add(new ConfigItem("应用名称", "spring.application.name"));
        items.add(new ConfigItem("激活环境", "spring.profiles.active"));
        items.add(new ConfigItem("服务端口", "server.port"));

        // 数据源
        items.add(new ConfigItem("MySQL用户名", "spring.datasource.username"));
        items.add(new ConfigItem("MySQL密码", "spring.datasource.password"));

        // Redis
        items.add(new ConfigItem("Redis 主机", "spring.data.redis.host"));
        items.add(new ConfigItem("Redis 端口", "spring.data.redis.port"));
        items.add(new ConfigItem("Redis 库", "spring.data.redis.database"));
        items.add(new ConfigItem("Redis 密码", "spring.data.redis.password"));

        // 邮件
        items.add(new ConfigItem("邮件服务器", "spring.mail.host"));
        items.add(new ConfigItem("邮件端口", "spring.mail.port"));
        items.add(new ConfigItem("邮件用户名", "spring.mail.username"));
        items.add(new ConfigItem("邮件密码", "spring.mail.password"));

        // 文件上传
        items.add(new ConfigItem("上传存储路径", "blog.upload.path"));
        items.add(new ConfigItem("上传访问前缀", "blog.upload.url-prefix"));
        items.add(new ConfigItem("上传最大限制", "blog.upload.max-size"));

        // 安全配置
        items.add(new ConfigItem("登录限流", "blog.security.login-rate-limit.enabled"));
        items.add(new ConfigItem("邮箱验证码", "blog.security.email-code.enabled"));

        printBanner(items);
    }

    private void printBanner(List<ConfigItem> items) {
        String title = " 启 动 配 置 信 息 ";
        int labelWidth = 16;
        int valueWidth = 56;
        int totalWidth = labelWidth + valueWidth + 3;

        StringBuilder sb = new StringBuilder();
        sb.append("\n");
        sb.append(repeat("=", totalWidth)).append("\n");
        int titlePadding = (totalWidth - title.length()) / 2;
        sb.append(repeat(" ", titlePadding)).append(title).append("\n");
        sb.append(repeat("-", totalWidth)).append("\n");

        for (ConfigItem item : items) {
            String rawValue = env.getProperty(item.key);
            String displayValue = rawValue == null || rawValue.isEmpty() ? "<未配置>" : rawValue;
            if (item.sensitive) {
                displayValue = mask(displayValue);
            }
            sb.append(String.format("| %" + (-labelWidth) + "s | %" + (-valueWidth) + "s |%n", item.label, displayValue));
        }

        sb.append(repeat("=", totalWidth));
        log.info(sb.toString());
    }

    private String mask(String value) {
        if (value == null || value.isEmpty()) {
            return "<未配置>";
        }
        if (value.length() <= 2) {
            return "*";
        }
        return value.charAt(0) + repeat("*", value.length() - 2) + value.charAt(value.length() - 1);
    }

    private String repeat(String ch, int count) {
        return ch.repeat(Math.max(0, count));
    }

    private record ConfigItem(String label, String key, boolean sensitive) {
        ConfigItem(String label, String key) {
            this(label, key, false);
        }
    }
}
