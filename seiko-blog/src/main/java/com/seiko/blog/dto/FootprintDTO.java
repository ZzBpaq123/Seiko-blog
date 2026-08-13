package com.seiko.blog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 足迹DTO
 */
@Data
@Schema(description = "足迹创建/更新请求")
public class FootprintDTO {

    @NotBlank(message = "城市名称不能为空")
    @Schema(description = "城市名称")
    private String city;

    @Schema(description = "省份/州")
    private String province;

    @NotBlank(message = "国家名称不能为空")
    @Schema(description = "国家名称")
    private String country;

    @NotBlank(message = "国家代码不能为空")
    @Schema(description = "国家代码")
    private String countryCode;

    @NotBlank(message = "足迹日期不能为空")
    @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "日期格式应为 YYYY-MM")
    @Schema(description = "足迹日期(YYYY-MM)")
    private String footprintDate;

    @Schema(description = "足迹描述")
    private String description;

    @Schema(description = "配图URL")
    private String image;

    @NotBlank(message = "足迹类型不能为空")
    @Schema(description = "足迹类型: domestic-国内, international-国际")
    private String footprintType;

    @Schema(description = "纬度")
    private BigDecimal lat;

    @Schema(description = "经度")
    private BigDecimal lng;
}
