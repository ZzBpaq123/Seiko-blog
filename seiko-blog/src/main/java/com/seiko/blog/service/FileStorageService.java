package com.seiko.blog.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * 文件存储服务
 */
public interface FileStorageService {

    /**
     * 存储上传的文件
     *
     * @param file 上传文件
     * @return 相对于上传目录的访问路径，例如 2026/06/xxx.png
     */
    String store(MultipartFile file);

}
