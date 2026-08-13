package com.seiko.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.seiko.blog.entity.Tag;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 标签表 Mapper
 */
@Mapper
public interface TagMapper extends BaseMapper<Tag> {

    /**
     * 根据文章ID查询标签列表
     */
    @Select("SELECT t.name FROM seiko_tags t " +
            "INNER JOIN seiko_post_tags pt ON t.id = pt.tag_id " +
            "WHERE pt.post_id = #{postId} AND t.is_deleted = 0")
    List<String> selectTagNamesByPostId(@Param("postId") Long postId);

    /**
     * 查询所有标签及其文章数量
     */
    @Select("SELECT t.name as tag, COUNT(DISTINCT p.id) as count " +
            "FROM seiko_tags t " +
            "LEFT JOIN seiko_post_tags pt ON t.id = pt.tag_id " +
            "LEFT JOIN seiko_posts p ON pt.post_id = p.id AND p.is_published = 1 AND p.is_deleted = 0 " +
            "WHERE t.is_deleted = 0 " +
            "GROUP BY t.id, t.name " +
            "ORDER BY count DESC")
    List<Map<String, Object>> selectTagCounts();
}
