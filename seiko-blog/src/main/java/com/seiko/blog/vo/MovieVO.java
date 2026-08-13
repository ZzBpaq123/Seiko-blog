package com.seiko.blog.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(description = "电影列表VO")
public class MovieVO {

    @Schema(description = "电影ID")
    private Long id;

    @Schema(description = "电影名称")
    private String movieName;

    @Schema(description = "是否置顶：0否 1是")
    private Integer isTop;

    @Schema(description = "影片评分")
    private BigDecimal rating;

    @Schema(description = "评分来源")
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
