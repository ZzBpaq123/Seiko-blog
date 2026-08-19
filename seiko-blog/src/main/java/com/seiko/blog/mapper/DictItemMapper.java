package com.seiko.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.seiko.blog.entity.DictItem;
import org.apache.ibatis.annotations.Mapper;

/**
 * 字典项 Mapper
 */
@Mapper
public interface DictItemMapper extends BaseMapper<DictItem> {
}
