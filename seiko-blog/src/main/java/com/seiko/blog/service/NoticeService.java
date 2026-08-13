package com.seiko.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.blog.dto.NoticeDTO;
import com.seiko.blog.vo.NoticeVO;

import java.util.List;

/**
 * 公告服务接口
 */
public interface NoticeService {

    /**
     * 获取已启用的公告列表
     *
     * @return 公告列表
     */
    List<NoticeVO> getEnabledNoticeList();

    /**
     * 获取公告详情
     *
     * @param id 公告ID
     * @return 公告详情
     */
    NoticeVO getNoticeById(Long id);

    /**
     * 分页获取公告列表
     *
     * @param page        当前页
     * @param size        每页大小
     * @param noticeTitle 公告标题模糊查询关键词，null 或空表示不限
     * @param enabled     是否启用，null 表示不限
     * @return 公告分页列表
     */
    Page<NoticeVO> getNoticePage(long page, long size, String noticeTitle, Boolean enabled);

    /**
     * 创建公告
     *
     * @param dto 公告创建请求
     * @return 新公告ID
     */
    Long createNotice(NoticeDTO dto);

    /**
     * 更新公告
     *
     * @param id  公告ID
     * @param dto 公告更新请求
     * @return 是否更新成功
     */
    Boolean updateNotice(Long id, NoticeDTO dto);

    /**
     * 删除公告
     *
     * @param id 公告ID
     * @return 是否删除成功
     */
    Boolean deleteNotice(Long id);

    /**
     * 更新公告启用状态
     *
     * @param id      公告ID
     * @param enabled 是否启用
     * @return 是否更新成功
     */
    Boolean updateEnabled(Long id, Boolean enabled);
}
