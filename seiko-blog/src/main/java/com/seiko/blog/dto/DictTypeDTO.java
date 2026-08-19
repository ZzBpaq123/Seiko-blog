package com.seiko.blog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * 字典类型 DTO
 */
@Data
@Schema(description = "字典类型创建/更新请求")
public class DictTypeDTO {

    @NotBlank(message = "字典类型编码不能为空")
    @Pattern(regexp = "^[a-z][a-z0-9_]{1,63}$",
            message = "类型编码需以小写字母开头，仅含小写字母、数字和下划线，长度 2-64")
    @Schema(description = "字典类型编码，如 common_status")
    private String typeCode;

    @NotBlank(message = "字典类型名称不能为空")
    @Schema(description = "字典类型名称，如 通用状态")
    private String typeName;

    @Schema(description = "备注")
    private String remark;

    @Schema(description = "是否启用: true-启用 false-停用")
    private Boolean enabled;

    @Schema(description = "排序")
    private Integer sortOrder;
}
