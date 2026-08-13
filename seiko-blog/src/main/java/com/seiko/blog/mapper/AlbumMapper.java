package com.seiko.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.seiko.blog.entity.Album;
import com.seiko.blog.vo.DateCountVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 相册 Mapper
 */
@Mapper
public interface AlbumMapper extends BaseMapper<Album> {

    /**
     * 按天统计新建相册数量
     *
     * @param startDate 起始时间（包含）
     * @return 日期 -> 新建数量列表
     */
    @Select("SELECT DATE_FORMAT(create_time, '%Y-%m-%d') AS date, COUNT(*) AS count " +
            "FROM seiko_album " +
            "WHERE is_deleted = 0 " +
            "  AND create_time >= #{startDate} " +
            "GROUP BY DATE_FORMAT(create_time, '%Y-%m-%d')")
    List<DateCountVO> selectCreationTrend(@Param("startDate") LocalDateTime startDate);
}
