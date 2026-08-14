package com.seiko.blog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 资源DTO
 */
@Data
@Schema(description = "资源创建/更新请求")
public class ResourceDTO {

    @NotBlank(message = "资源图标不能为空")
    @Schema(description = "资源图标")
    private String resourceIcon;

    @NotBlank(message = "资源名称不能为空")
    @Schema(description = "资源名称")
    private String resourceName;

    @NotBlank(message = "资源网址不能为空")
    @Schema(description = "资源网址")
    private String resourceUrl;

    @Schema(description = "资源分类(如:开发工具/设计资源/学习)")
    private String category;

    @Schema(description = "资源简介")
    private String description;

    @Schema(description = "排序序号(越小越靠前)")
    private Integer sortOrder;

    @Schema(description = "是否启用")
    private Boolean enabled;
}
