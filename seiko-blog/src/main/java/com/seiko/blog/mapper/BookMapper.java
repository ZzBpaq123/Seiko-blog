package com.seiko.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.seiko.blog.entity.Book;
import org.apache.ibatis.annotations.Mapper;

/**
 * 书籍 Mapper
 */
@Mapper
public interface BookMapper extends BaseMapper<Book> {
}
