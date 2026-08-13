package com.seiko.blog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 标签DTO
 */
@Data
@Schema(description = "标签创建/更新请求")
public class TagDTO {

    @NotBlank(message = "标签名称不能为空")
    @Schema(description = "标签名称")
    private String name;

    @Schema(description = "URL友好标识，为空时根据名称自动生成")
    private String slug;
}
