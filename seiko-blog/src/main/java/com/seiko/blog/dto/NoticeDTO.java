package com.seiko.blog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 公告DTO
 */
@Data
@Schema(description = "公告创建/更新请求")
public class NoticeDTO {

    @NotBlank(message = "公告标题不能为空")
    @Schema(description = "公告标题")
    private String noticeTitle;

    @Schema(description = "公告内容")
    private String noticeContent;

    @Schema(description = "公告配图URL")
    private String noticeImage;

    @Schema(description = "跳转链接")
    private String noticeLink;

    @Schema(description = "排序序号")
    private Integer sortOrder;

    @Schema(description = "是否启用")
    private Boolean enabled;
}
