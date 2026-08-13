package com.seiko.blog.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 资源分组VO（按分类聚合，用于前台展示）
 */
@Data
@Schema(description = "资源分类分组")
public class ResourceGroupVO {

    @Schema(description = "资源分类名称")
    private String category;

    @Schema(description = "该分类下的资源列表")
    private List<ResourceVO> resources;
}
