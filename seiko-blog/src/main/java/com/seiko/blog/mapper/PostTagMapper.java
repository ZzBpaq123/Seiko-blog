package com.seiko.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.seiko.blog.entity.PostTag;
import org.apache.ibatis.annotations.Mapper;

/**
 * 文章标签关联表 Mapper
 */
@Mapper
public interface PostTagMapper extends BaseMapper<PostTag> {

}
