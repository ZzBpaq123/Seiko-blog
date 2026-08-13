package com.seiko.blog.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "书籍列表VO")
public class BookVO {

    @Schema(description = "书籍ID")
    private Long id;

    @Schema(description = "书籍名称")
    private String bookName;

    @Schema(description = "书籍作者")
    private String bookAuthor;

    @Schema(description = "书籍封面")
    private String bookCover;

    @Schema(description = "书籍简介")
    private String description;
}
