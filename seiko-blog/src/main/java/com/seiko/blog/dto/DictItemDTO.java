package com.seiko.blog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 字典项 DTO
 */
@Data
@Schema(description = "字典项创建/更新请求")
public class DictItemDTO {

    @NotBlank(message = "所属字典类型编码不能为空")
    @Schema(description = "所属字典类型编码")
    private String typeCode;

    @NotBlank(message = "字典项标签不能为空")
    @Schema(description = "展示文案，如 开启")
    private String itemLabel;

    @NotBlank(message = "字典项值不能为空")
    @Schema(description = "存储值，如 0")
    private String itemValue;

    @Schema(description = "标签样式: green/red/yellow/blue/gray")
    private String itemTag;

    @Schema(description = "是否默认项")
    private Boolean isDefault;

    @Schema(description = "是否启用: true-启用 false-停用")
    private Boolean enabled;

    @Schema(description = "排序")
    private Integer sortOrder;
}
