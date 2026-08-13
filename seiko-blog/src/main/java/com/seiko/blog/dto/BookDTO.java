package com.seiko.blog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 书籍DTO
 */
@Data
@Schema(description = "书籍创建/更新请求")
public class BookDTO {

    @NotBlank(message = "书籍名称不能为空")
    @Schema(description = "书籍名称")
    private String bookName;

    @Schema(description = "书籍作者")
    private String bookAuthor;

    @Schema(description = "书籍封面")
    private String bookCover;

    @Schema(description = "书籍简介")
    private String description;
}
