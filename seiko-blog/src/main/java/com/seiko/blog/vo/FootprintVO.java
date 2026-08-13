package com.seiko.blog.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 足迹VO
 */
@Data
@Schema(description = "足迹信息")
public class FootprintVO {

    @Schema(description = "足迹ID")
    private Long id;

    @Schema(description = "城市名称")
    private String city;

    @Schema(description = "省份/州")
    private String province;

    @Schema(description = "国家名称")
    private String country;

    @Schema(description = "国家代码")
    private String countryCode;

    @Schema(description = "足迹日期(YYYY-MM)")
    private String footprintDate;

    @Schema(description = "足迹描述")
    private String description;

    @Schema(description = "配图URL")
    private String image;

    @Schema(description = "足迹类型: domestic-国内, international-国际")
    private String footprintType;

    @Schema(description = "纬度")
    private BigDecimal lat;

    @Schema(description = "经度")
    private BigDecimal lng;

    @Schema(description = "创建时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;
}
