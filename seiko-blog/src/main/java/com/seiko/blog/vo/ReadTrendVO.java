package com.seiko.blog.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 阅读量趋势项
 */
@Data
@Schema(description = "阅读量趋势项")
public class ReadTrendVO {

    @Schema(description = "日期，格式 yyyy-MM-dd")
    private String date;

    @Schema(description = "当日阅读次数")
    private Long count;
}
