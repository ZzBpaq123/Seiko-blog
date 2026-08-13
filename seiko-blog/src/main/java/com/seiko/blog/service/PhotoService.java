package com.seiko.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.blog.dto.PhotoDTO;
import com.seiko.blog.vo.PhotoVO;

import java.util.List;

/**
 * 相册服务接口
 */
public interface PhotoService {

    /**
     * 获取照片列表
     *
     * @return 相册列表
     */
    List<PhotoVO> getPhotoList();

    /**
     * 获取相册详情
     *
     * @param id 相册ID
     * @return 相册详情
     */
    PhotoVO getPhotoById(Long id);

    /**
     * 根据拍摄地点获取相册列表
     *
     * @param location 拍摄地点
     * @return 相册列表
     */
    List<PhotoVO> getPhotoListByLocation(String location);

    /**
     * 根据相册ID获取照片列表
     *
     * @param albumId 相册ID
     * @return 照片列表
     */
    List<PhotoVO> getPhotosByAlbumId(Long albumId);

    /**
     * 分页获取照片列表
     *
     * @param page     当前页
     * @param size     每页大小
     * @param albumId  相册ID，null 表示不限
     * @param location 拍摄地点模糊查询关键词，null 或空表示不限
     * @return 照片分页列表
     */
    Page<PhotoVO> getPhotoPage(long page, long size, Long albumId, String location);

    /**
     * 创建照片
     *
     * @param dto 照片创建请求
     * @return 新照片ID
     */
    Long createPhoto(PhotoDTO dto);

    /**
     * 批量创建照片
     *
     * @param dtoList 照片创建请求列表
     * @return 是否创建成功
     */
    Boolean batchCreatePhotos(List<PhotoDTO> dtoList);

    /**
     * 更新照片
     *
     * @param id  照片ID
     * @param dto 照片更新请求
     * @return 是否更新成功
     */
    Boolean updatePhoto(Long id, PhotoDTO dto);

    /**
     * 删除照片
     *
     * @param id 照片ID
     * @return 是否删除成功
     */
    Boolean deletePhoto(Long id);
}
