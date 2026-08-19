package com.seiko.blog.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Date;

/**
 * 字典项 VO
 */
@Data
@Schema(description = "字典项信息")
public class DictItemVO {

    @Schema(description = "字典项ID")
    private Long id;

    @Schema(description = "所属字典类型编码")
    private String typeCode;

    @Schema(description = "展示文案")
    private String itemLabel;

    @Schema(description = "存储值")
    private String itemValue;

    @Schema(description = "标签样式")
    private String itemTag;

    @Schema(description = "是否默认项")
    private Boolean isDefault;

    @Schema(description = "是否启用")
    private Boolean enabled;

    @Schema(description = "排序")
    private Integer sortOrder;

    @Schema(description = "创建时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;
}
