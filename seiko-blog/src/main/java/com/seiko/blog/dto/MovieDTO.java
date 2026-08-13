package com.seiko.blog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 电影DTO
 */
@Data
@Schema(description = "电影创建/更新请求")
public class MovieDTO {

    @NotBlank(message = "电影名称不能为空")
    @Schema(description = "电影名称")
    private String movieName;

    @NotNull(message = "是否置顶不能为空")
    @Schema(description = "是否置顶：0否 1是")
    private Integer isTop;

    @NotNull(message = "影片评分不能为空")
    @DecimalMin(value = "0.0", message = "评分不能小于0")
    @DecimalMax(value = "10.0", message = "评分不能大于10")
    @Schema(description = "影片评分(如8.9)")
    private BigDecimal rating;

    @Schema(description = "评分来源(豆瓣)")
    private String ratingSource;

    @Schema(description = "影片标签，逗号分隔")
    private String tags;

    @Schema(description = "电影剧情简介")
    private String synopsis;

    @Schema(description = "横版背景大图URL")
    private String backdrop;

    @Schema(description = "影片时长(单位:分钟)")
    private Integer duration;
}
