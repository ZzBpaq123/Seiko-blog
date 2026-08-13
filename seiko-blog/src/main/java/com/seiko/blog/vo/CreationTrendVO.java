package com.seiko.blog.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 内容新建趋势项：按天统计新建文章、相册、照片数量
 */
@Data
@Schema(description = "内容新建趋势项")
public class CreationTrendVO {

    @Schema(description = "日期，格式 yyyy-MM-dd")
    private String date;

    @Schema(description = "当日新建文章数量")
    private Long postCount;

    @Schema(description = "当日新建相册数量")
    private Long albumCount;

    @Schema(description = "当日新增照片数量")
    private Long photoCount;
}
