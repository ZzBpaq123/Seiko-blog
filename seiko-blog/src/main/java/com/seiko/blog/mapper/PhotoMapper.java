package com.seiko.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.seiko.blog.entity.Photo;
import com.seiko.blog.vo.DateCountVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 照片 Mapper
 */
@Mapper
public interface PhotoMapper extends BaseMapper<Photo> {

    /**
     * 按天统计新增照片数量
     *
     * @param startDate 起始时间（包含）
     * @return 日期 -> 新增数量列表
     */
    @Select("SELECT DATE_FORMAT(create_time, '%Y-%m-%d') AS date, COUNT(*) AS count " +
            "FROM seiko_photos " +
            "WHERE is_deleted = 0 " +
            "  AND create_time >= #{startDate} " +
            "GROUP BY DATE_FORMAT(create_time, '%Y-%m-%d')")
    List<DateCountVO> selectCreationTrend(@Param("startDate") LocalDateTime startDate);
}
