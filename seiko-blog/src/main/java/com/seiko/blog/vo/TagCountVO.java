package com.seiko.blog.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 标签统计VO
 */
@Data
@AllArgsConstructor
public class TagCountVO {
    private String tag;
    private Integer count;
    private Integer total;
}
