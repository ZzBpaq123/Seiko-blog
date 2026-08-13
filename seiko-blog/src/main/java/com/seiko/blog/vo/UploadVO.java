package com.seiko.blog.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 文件上传响应 VO
 */
@Data
@Schema(description = "文件上传响应")
public class UploadVO {

    @Schema(description = "文件访问 URL")
    private String url;

    @Schema(description = "原始文件名")
    private String originalName;

    @Schema(description = "文件大小，单位字节")
    private Long size;

}
