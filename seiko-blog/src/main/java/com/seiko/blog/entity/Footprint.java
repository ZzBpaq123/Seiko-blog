package com.seiko.blog.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.seiko.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.math.BigDecimal;

/**
 * 足迹表实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("seiko_footprints")
public class Footprint extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 城市名称
     */
    private String city;

    /**
     * 省份/州
     */
    private String province;

    /**
     * 国家名称
     */
    private String country;

    /**
     * 国家代码(如CN)
     */
    @TableField("country_code")
    private String countryCode;

    /**
     * 足迹日期(格式: YYYY-MM)
     */
    @TableField("footprint_date")
    private String footprintDate;

    /**
     * 足迹描述
     */
    private String description;

    /**
     * 配图URL
     */
    private String image;

    /**
     * 足迹类型: domestic-国内, international-国际
     */
    @TableField("footprint_type")
    private String footprintType;

    /**
     * 纬度
     */
    private BigDecimal lat;

    /**
     * 经度
     */
    private BigDecimal lng;
}
