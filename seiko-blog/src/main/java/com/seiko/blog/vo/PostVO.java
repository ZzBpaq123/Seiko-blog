package com.seiko.blog.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Date;
import java.util.List;

/**
 * 文章列表视图对象
 */
@Data
@Schema(description = "文章列表VO")
public class PostVO {

    @Schema(description = "文章ID")
    private Long id;

    @Schema(description = "URL友好标识")
    private String slug;

    @Schema(description = "文章标题")
    private String title;

    @Schema(description = "文章摘要")
    private String excerpt;

    @Schema(description = "文章内容(Markdown)")
    private String content;

    @Schema(description = "发布日期")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private Date date;

    @Schema(description = "作者")
    private String author;

    @Schema(description = "标签列表")
    private List<String> tags;

    @Schema(description = "阅读次数")
    private Integer readNum;

    @Schema(description = "封面图路径")
    private String cover;

    @Schema(description = "是否发布")
    private Boolean published;
}
