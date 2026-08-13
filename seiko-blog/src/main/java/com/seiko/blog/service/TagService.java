package com.seiko.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.blog.dto.TagDTO;
import com.seiko.blog.vo.TagVO;

/**
 * 标签服务接口
 */
public interface TagService {

    /**
     * 分页获取标签列表
     *
     * @param page    当前页
     * @param size    每页大小
     * @param keyword 名称/标识模糊查询关键词，null 或空表示不限
     * @return 标签分页列表
     */
    Page<TagVO> getTagPage(long page, long size, String keyword);

    /**
     * 获取标签详情
     *
     * @param id 标签ID
     * @return 标签详情
     */
    TagVO getTagById(Long id);

    /**
     * 创建标签
     *
     * @param dto 标签创建请求
     * @return 新标签ID
     */
    Long createTag(TagDTO dto);

    /**
     * 更新标签
     *
     * @param id  标签ID
     * @param dto 标签更新请求
     * @return 是否更新成功
     */
    Boolean updateTag(Long id, TagDTO dto);

    /**
     * 删除标签
     *
     * @param id 标签ID
     * @return 是否删除成功
     */
    Boolean deleteTag(Long id);
}
