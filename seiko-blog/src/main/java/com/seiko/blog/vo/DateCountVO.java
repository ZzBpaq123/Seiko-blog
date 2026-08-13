package com.seiko.blog.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 按天聚合的计数项（通用）
 */
@Data
@Schema(description = "按天聚合的计数项")
public class DateCountVO {

    @Schema(description = "日期，格式 yyyy-MM-dd")
    private String date;

    @Schema(description = "当日数量")
    private Long count;
}
