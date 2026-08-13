package com.seiko.blog.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Arrays;
import java.util.List;

/**
 * 文件上传配置属性
 */
@Data
@ConfigurationProperties(prefix = "blog.upload")
public class UploadConfig {

    /**
     * 本地存储目录，默认当前项目下的 uploads 目录
     */
    private String path = "./uploads";

    /**
     * 浏览器访问路径前缀，默认 /uploads
     */
    private String urlPrefix = "/uploads";

    /**
     * 单个文件最大限制，单位字节，默认 10MB
     */
    private long maxSize = 10 * 1024 * 1024;

    /**
     * 允许上传的文件 MIME 类型
     */
    private List<String> allowedTypes = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

}