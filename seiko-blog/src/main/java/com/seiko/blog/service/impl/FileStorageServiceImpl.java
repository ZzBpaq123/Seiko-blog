package com.seiko.blog.service.impl;

import com.seiko.common.exception.BusinessException;
import com.seiko.common.result.ResultCode;
import com.seiko.blog.config.UploadConfig;
import com.seiko.blog.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;

/**
 * 本地文件存储服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements FileStorageService {

    private final UploadConfig uploadProperties;

    @Override
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "上传文件不能为空");
        }

        String contentType = file.getContentType();
        if (contentType == null || uploadProperties.getAllowedTypes().stream()
                .noneMatch(type -> type.equalsIgnoreCase(contentType))) {
            throw new BusinessException(ResultCode.FILE_TYPE_NOT_ALLOWED);
        }

        if (file.getSize() > uploadProperties.getMaxSize()) {
            throw new BusinessException(ResultCode.FILE_SIZE_EXCEEDED);
        }

        String originalFilename = file.getOriginalFilename();
        String ext = extractExtension(originalFilename);
        if (ext.isEmpty()) {
            throw new BusinessException(ResultCode.FILE_TYPE_NOT_ALLOWED.getCode(), "无法识别文件扩展名");
        }

        String relativeDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        String filename = UUID.randomUUID() + "." + ext.toLowerCase(Locale.ROOT);
        String relativePath = relativeDir + "/" + filename;

        Path targetPath = Paths.get(uploadProperties.getPath(), relativeDir, filename).toAbsolutePath().normalize();

        try {
            Files.createDirectories(targetPath.getParent());
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath);
            }
        } catch (IOException e) {
            log.error("文件上传失败: {}", e.getMessage(), e);
            throw new BusinessException(ResultCode.FILE_UPLOAD_ERROR);
        }

        log.info("文件上传成功: {} -> {}", originalFilename, targetPath);
        return relativePath;
    }

    /**
     * 提取文件扩展名
     */
    private String extractExtension(String filename) {
        if (filename == null || filename.isBlank()) {
            return "";
        }
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex == -1 || dotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(dotIndex + 1);
    }

}
