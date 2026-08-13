package com.seiko.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.blog.dto.AlbumDTO;
import com.seiko.blog.vo.AlbumVO;

import java.util.List;

/**
 * 相册服务接口
 */
public interface AlbumService {

    /**
     * 获取相册列表
     *
     * @return 相册列表
     */
    List<AlbumVO> getAlbumList();

    /**
     * 分页获取相册列表
     *
     * @param page      当前页
     * @param size      每页大小
     * @param albumName 相册名称模糊查询关键词，null 或空表示不限
     * @return 相册分页列表
     */
    Page<AlbumVO> getAlbumPage(long page, long size, String albumName);

    /**
     * 获取相册详情
     *
     * @param id 相册ID
     * @return 相册详情
     */
    AlbumVO getAlbumById(Long id);

    /**
     * 创建相册
     *
     * @param dto 相册创建请求
     * @return 新相册ID
     */
    Long createAlbum(AlbumDTO dto);

    /**
     * 更新相册
     *
     * @param id  相册ID
     * @param dto 相册更新请求
     * @return 是否更新成功
     */
    Boolean updateAlbum(Long id, AlbumDTO dto);

    /**
     * 删除相册（同时删除相册下的照片）
     *
     * @param id 相册ID
     * @return 是否删除成功
     */
    Boolean deleteAlbum(Long id);
}
