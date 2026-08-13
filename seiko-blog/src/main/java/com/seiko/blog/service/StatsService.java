package com.seiko.blog.service;

import com.seiko.blog.vo.CreationTrendVO;
import com.seiko.blog.vo.ReadTrendVO;
import com.seiko.blog.vo.StatsVO;

import java.util.List;

/**
 * 数据统计服务接口
 */
public interface StatsService {

    /**
     * 获取后台数据统计概览（各模块数量、文章阅读量等）
     *
     * @return 数据统计概览
     */
    StatsVO getStats();

    /**
     * 获取近 N 天阅读量趋势
     *
     * @param days 统计天数，范围 1-30
     * @return 每日阅读次数列表
     */
    List<ReadTrendVO> getReadTrend(int days);

    /**
     * 获取近 N 天内容新建趋势（每日新建文章、相册、照片数量）
     *
     * @param days 统计天数，范围 1-30
     * @return 每日新建数量列表
     */
    List<CreationTrendVO> getCreationTrend(int days);
}
