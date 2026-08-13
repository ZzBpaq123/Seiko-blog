package com.seiko.blog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

/**
 * 文章DTO
 */
@Data
@Schema(description = "文章创建/更新请求")
public class PostDTO {

    @Schema(description = "URL友好标识，为空时根据标题自动生成")
    private String slug;

    @NotBlank(message = "文章标题不能为空")
    @Schema(description = "文章标题")
    private String title;

    @NotBlank(message = "文章摘要不能为空")
    @Schema(description = "文章摘要")
    private String excerpt;

    @NotBlank(message = "文章内容不能为空")
    @Schema(description = "文章内容(Markdown)")
    private String content;

    @Schema(description = "封面图路径")
    private String cover;

    @Schema(description = "作者")
    private String author;

    @Schema(description = "是否发布: false-草稿 true-已发布，默认草稿")
    private Boolean published;

    @Schema(description = "标签名称列表")
    private List<String> tags;
}
