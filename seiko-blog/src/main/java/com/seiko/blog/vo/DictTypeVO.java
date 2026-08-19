package com.seiko.blog.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Date;

/**
 * 字典类型 VO
 */
@Data
@Schema(description = "字典类型信息")
public class DictTypeVO {

    @Schema(description = "字典类型ID")
    private Long id;

    @Schema(description = "字典类型编码")
    private String typeCode;

    @Schema(description = "字典类型名称")
    private String typeName;

    @Schema(description = "备注")
    private String remark;

    @Schema(description = "是否启用: true-启用 false-停用")
    private Boolean enabled;

    @Schema(description = "排序")
    private Integer sortOrder;

    @Schema(description = "字典项数量")
    private Long itemCount;

    @Schema(description = "创建时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;
}
