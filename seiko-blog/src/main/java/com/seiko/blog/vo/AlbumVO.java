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
public class AlbumVO {

    @Schema(description = "相册ID")
    private Long id;

    @Schema(description = "相册名称")
    private String albumName;

    @Schema(description = "相册简介描述")
    private String albumDesc;

    @Schema(description = "相册封面图URL")
    private String albumCover;

    @Schema(description = "相册所属时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date albumTime;
}
