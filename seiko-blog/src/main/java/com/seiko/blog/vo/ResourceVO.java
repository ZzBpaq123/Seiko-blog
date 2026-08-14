package com.seiko.blog.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Date;

/**
 * 资源VO
 */
@Data
@Schema(description = "资源信息")
public class ResourceVO {

    @Schema(description = "资源ID")
    private Long id;

    @Schema(description = "资源图标")
    private String resourceIcon;

    @Schema(description = "资源名称")
    private String resourceName;

    @Schema(description = "资源网址")
    private String resourceUrl;

    @Schema(description = "资源分类")
    private String category;

    @Schema(description = "资源简介")
    private String description;

    @Schema(description = "排序序号")
    private Integer sortOrder;

    @Schema(description = "是否启用")
    private Boolean enabled;

    @Schema(description = "创建时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;
}
