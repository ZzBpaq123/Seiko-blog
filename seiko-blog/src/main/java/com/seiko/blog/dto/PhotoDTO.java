package com.seiko.blog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

/**
 * 相册DTO
 */
@Data
@Schema(description = "相册创建/更新请求")
public class PhotoDTO {

    @NotNull(message = "相册ID不能为空")
    @Schema(description = "相册ID")
    private Long albumId;

    @NotBlank(message = "图片URL不能为空")
    @Schema(description = "图片URL地址")
    private String photoSrc;

    @NotBlank(message = "图片替代文本不能为空")
    @Schema(description = "图片替代文本")
    private String photoAlt;

    @NotNull(message = "图片宽度不能为空")
    @Positive(message = "图片宽度必须为正数")
    @Schema(description = "图片宽度(px)")
    private Integer photoWidth;

    @NotNull(message = "图片高度不能为空")
    @Positive(message = "图片高度必须为正数")
    @Schema(description = "图片高度(px)")
    private Integer photoHeight;

    @Schema(description = "图片标题")
    private String photoTitle;

    @Schema(description = "拍摄地点")
    private String photoLocation;

    @Schema(description = "拍摄日期")
    private LocalDate photoDate;

    @Schema(description = "排序序号")
    private Integer sortOrder;
}
