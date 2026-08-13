package com.seiko.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.blog.dto.FootprintDTO;
import com.seiko.blog.vo.FootprintVO;

import java.util.List;

/**
 * 足迹服务接口
 */
public interface FootprintService {

    /**
     * 获取足迹列表
     *
     * @return 足迹列表
     */
    List<FootprintVO> getFootprintList();

    /**
     * 获取足迹详情
     *
     * @param id 足迹ID
     * @return 足迹详情
     */
    FootprintVO getFootprintById(Long id);

    /**
     * 根据足迹类型获取列表
     *
     * @param type 足迹类型
     * @return 足迹列表
     */
    List<FootprintVO> getFootprintListByType(String type);

    /**
     * 分页获取足迹列表
     *
     * @param page 当前页
     * @param size 每页大小
     * @param type 足迹类型，null 表示不限
     * @param city 城市名称模糊查询关键词，null 或空表示不限
     * @return 足迹分页列表
     */
    Page<FootprintVO> getFootprintPage(long page, long size, String type, String city);

    /**
     * 创建足迹
     *
     * @param dto 足迹创建请求
     * @return 新足迹ID
     */
    Long createFootprint(FootprintDTO dto);

    /**
     * 更新足迹
     *
     * @param id  足迹ID
     * @param dto 足迹更新请求
     * @return 是否更新成功
     */
    Boolean updateFootprint(Long id, FootprintDTO dto);

    /**
     * 删除足迹
     *
     * @param id 足迹ID
     * @return 是否删除成功
     */
    Boolean deleteFootprint(Long id);
}
