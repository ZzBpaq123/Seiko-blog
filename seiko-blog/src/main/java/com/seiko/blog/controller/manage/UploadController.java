package com.seiko.blog.controller.manage;

import com.seiko.common.annotation.OperationLog;
import com.seiko.common.result.Result;
import com.seiko.blog.config.UploadConfig;
import com.seiko.blog.service.FileStorageService;
import com.seiko.blog.vo.UploadVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * 文件上传控制器
 */
@Tag(name = "文件上传", description = "本地文件上传相关接口")
@RestController
@RequestMapping("/api/manage/upload")
@RequiredArgsConstructor
public class UploadController {

    private final FileStorageService fileStorageService;
    private final UploadConfig uploadProperties;

    /**
     * 上传图片
     *
     * @param file 图片文件
     * @return 上传结果，包含可访问的完整 URL
     */
    @OperationLog(action = "上传图片")
    @Operation(summary = "上传图片", description = "上传图片到本地服务器，返回可浏览器访问的完整 URL")
    @Parameter(name = "file", description = "图片文件", required = true)
    @PostMapping("/image")
    public Result<UploadVO> uploadImage(@RequestParam("file") MultipartFile file) {
        String relativePath = fileStorageService.store(file);

        String url = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(uploadProperties.getUrlPrefix())
                .path("/")
                .path(relativePath)
                .toUriString();

        UploadVO uploadVO = new UploadVO();
        uploadVO.setUrl(url);
        uploadVO.setOriginalName(file.getOriginalFilename());
        uploadVO.setSize(file.getSize());

        return Result.success("上传成功", uploadVO);
    }

}
