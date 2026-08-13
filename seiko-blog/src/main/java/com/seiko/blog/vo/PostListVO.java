package com.seiko.blog.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 文章列表分页结果
 */
@Data
@Schema(description = "文章列表分页结果")
public class PostListVO {

    @Schema(description = "文章列表")
    private List<PostVO> list;

    @Schema(description = "总数")
    private Long total;

    @Schema(description = "当前页")
    private Long current;

    @Schema(description = "每页大小")
    private Long size;
}
