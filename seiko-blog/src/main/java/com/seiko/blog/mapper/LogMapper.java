package com.seiko.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.seiko.blog.entity.Log;
import com.seiko.blog.vo.ReadTrendVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 日志 Mapper
 */
@Mapper
public interface LogMapper extends BaseMapper<Log> {

    /**
     * 按天统计文章详情访问次数
     *
     * <p>统计规则：GET 请求 /api/blog/posts/{slug} 且响应成功（200）的操作日志。</p>
     *
     * @param startDate 起始时间（包含）
     * @return 日期 -> 阅读次数列表
     */
    @Select("SELECT DATE_FORMAT(create_time, '%Y-%m-%d') AS date, COUNT(*) AS count " +
            "FROM seiko_logs " +
            "WHERE log_type = 'operation' " +
            "  AND request_method = 'GET' " +
            "  AND request_url LIKE '/api/blog/posts/%' " +
            "  AND request_url NOT LIKE '/api/blog/posts/%/%' " +
            "  AND response_code = 200 " +
            "  AND is_deleted = 0 " +
            "  AND create_time >= #{startDate} " +
            "GROUP BY DATE_FORMAT(create_time, '%Y-%m-%d') " +
            "ORDER BY date ASC")
    List<ReadTrendVO> selectReadTrend(@Param("startDate") LocalDateTime startDate);
}
