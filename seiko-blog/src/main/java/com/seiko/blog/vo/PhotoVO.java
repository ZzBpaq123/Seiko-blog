package com.seiko.blog.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Date;

/**
 * 相册VO
 */
@Data
@Schema(description = "相册信息")
public class PhotoVO {

    @Schema(description = "图片ID")
    private Long id;

    @Schema(description = "相册ID")
    private Long albumId;

    @Schema(description = "图片URL地址")
    private String photoSrc;

    @Schema(description = "图片替代文本")
    private String photoAlt;

    @Schema(description = "图片宽度(px)")
    private Integer photoWidth;

    @Schema(description = "图片高度(px)")
    private Integer photoHeight;

    @Schema(description = "图片标题")
    private String photoTitle;

    @Schema(description = "拍摄地点")
    private String photoLocation;

    @Schema(description = "拍摄日期")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private Date photoDate;

    @Schema(description = "排序序号")
    private Integer sortOrder;

    @Schema(description = "创建时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;
}
