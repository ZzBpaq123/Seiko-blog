package com.seiko.blog.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Date;

/**
 * 相册DTO
 */
@Data
@Schema(description = "相册创建/更新请求")
public class AlbumDTO {

    @NotBlank(message = "相册名称不能为空")
    @Schema(description = "相册名称")
    private String albumName;

    @Schema(description = "相册简介描述")
    private String albumDesc;

    @Schema(description = "相册封面图URL")
    private String albumCover;

    @Schema(description = "相册所属时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date albumTime;
}
