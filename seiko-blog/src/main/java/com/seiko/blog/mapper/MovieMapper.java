package com.seiko.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.seiko.blog.entity.Movie;
import org.apache.ibatis.annotations.Mapper;

/**
 * 电影 Mapper
 */
@Mapper
public interface MovieMapper extends BaseMapper<Movie> {
}
