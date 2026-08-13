package com.seiko.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.blog.dto.ResourceDTO;
import com.seiko.blog.vo.ResourceGroupVO;
import com.seiko.blog.vo.ResourceVO;

import java.util.List;

/**
 * 资源服务接口
 */
public interface ResourceService {

    /**
     * 获取已启用的资源分组列表（按分类聚合，用于前台展示）
     *
     * @return 资源分组列表
     */
    List<ResourceGroupVO> getEnabledResourceGroups();

    /**
     * 获取资源详情
     *
     * @param id 资源ID
     * @return 资源详情
     */
    ResourceVO getResourceById(Long id);

    /**
     * 分页获取资源列表
     *
     * @param page         当前页
     * @param size         每页大小
     * @param resourceName 资源名称模糊查询关键词，null 或空表示不限
     * @param category     资源分类，null 或空表示不限
     * @param enabled      是否启用，null 表示不限
     * @return 资源分页列表
     */
    Page<ResourceVO> getResourcePage(long page, long size, String resourceName, String category, Boolean enabled);

    /**
     * 创建资源
     *
     * @param dto 资源创建请求
     * @return 新资源ID
     */
    Long createResource(ResourceDTO dto);

    /**
     * 更新资源
     *
     * @param id  资源ID
     * @param dto 资源更新请求
     * @return 是否更新成功
     */
    Boolean updateResource(Long id, ResourceDTO dto);

    /**
     * 删除资源
     *
     * @param id 资源ID
     * @return 是否删除成功
     */
    Boolean deleteResource(Long id);

    /**
     * 更新资源启用状态
     *
     * @param id      资源ID
     * @param enabled 是否启用
     * @return 是否更新成功
     */
    Boolean updateEnabled(Long id, Boolean enabled);
}
