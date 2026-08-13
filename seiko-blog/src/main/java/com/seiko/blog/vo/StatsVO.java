package com.seiko.blog.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 后台数据统计VO
 */
@Data
@Schema(description = "后台数据统计VO")
public class StatsVO {

    @Schema(description = "文章总数（已发布）")
    private Long postCount;

    @Schema(description = "评论总数")
    private Long commentCount;

    @Schema(description = "相册总数")
    private Long albumCount;

    @Schema(description = "照片总数")
    private Long photoCount;

    @Schema(description = "文章总阅读量")
    private Long totalReadNum;
}
