package com.seiko.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.seiko.common.exception.BusinessException;
import com.seiko.common.result.ResultCode;
import com.seiko.blog.config.RedisCacheConfig;
import com.seiko.blog.dto.PhotoDTO;
import com.seiko.blog.entity.Album;
import com.seiko.blog.entity.Photo;
import com.seiko.blog.mapper.AlbumMapper;
import com.seiko.blog.mapper.PhotoMapper;
import com.seiko.blog.service.PhotoService;
import com.seiko.blog.vo.PhotoVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 相册服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PhotoServiceImpl extends ServiceImpl<PhotoMapper, Photo> implements PhotoService {

    private final PhotoMapper photoMapper;
    private final AlbumMapper albumMapper;

    @Override
    @Cacheable(cacheNames = RedisCacheConfig.CACHE_PHOTO, key = "'all'")
    public List<PhotoVO> getPhotoList() {
        return photoMapper.selectList(
                new LambdaQueryWrapper<Photo>()
                    .orderByAsc(Photo::getSortOrder)
                    .orderByDesc(Photo::getId)
        ).stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    @Cacheable(cacheNames = RedisCacheConfig.CACHE_PHOTO, key = "'id:' + #id", unless = "#result == null")
    public PhotoVO getPhotoById(Long id) {
        Photo photo = photoMapper.selectById(id);
        if (photo == null || photo.getIsDeleted() == 1) {
            throw new BusinessException(500, "图片不存在");
        }
        return convertToVO(photo);
    }

    @Override
    @Cacheable(cacheNames = RedisCacheConfig.CACHE_PHOTO, key = "'location:' + #location")
    public List<PhotoVO> getPhotoListByLocation(String location) {
        return photoMapper.selectList(
                new LambdaQueryWrapper<Photo>()
                    .eq(Photo::getPhotoLocation, location)
                    .orderByAsc(Photo::getSortOrder)
                    .orderByDesc(Photo::getId)
        ).stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    @Cacheable(cacheNames = RedisCacheConfig.CACHE_PHOTO, key = "'album:' + #albumId")
    public List<PhotoVO> getPhotosByAlbumId(Long albumId) {
        return photoMapper.selectList(
                new LambdaQueryWrapper<Photo>()
                    .eq(Photo::getAlbumId, albumId)
                    .orderByAsc(Photo::getSortOrder)
                    .orderByDesc(Photo::getId)
        ).stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    public Page<PhotoVO> getPhotoPage(long page, long size, Long albumId, String location) {
        Page<Photo> photoPage = new Page<>(page, size);
        LambdaQueryWrapper<Photo> wrapper = new LambdaQueryWrapper<>();
        if (albumId != null) {
            wrapper.eq(Photo::getAlbumId, albumId);
        }
        if (location != null && !location.isBlank()) {
            wrapper.like(Photo::getPhotoLocation, location.trim());
        }
        wrapper.orderByAsc(Photo::getSortOrder).orderByDesc(Photo::getId);

        Page<Photo> result = this.page(photoPage, wrapper);

        List<PhotoVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        Page<PhotoVO> voPage = new Page<>();
        BeanUtils.copyProperties(result, voPage);
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_PHOTO, allEntries = true)
    public Long createPhoto(PhotoDTO dto) {
        checkAlbumExists(dto.getAlbumId());

        Photo photo = new Photo();
        BeanUtils.copyProperties(dto, photo);

        this.save(photo);
        return photo.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_PHOTO, allEntries = true)
    public Boolean batchCreatePhotos(List<PhotoDTO> dtoList) {
        if (dtoList == null || dtoList.isEmpty()) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "照片列表不能为空");
        }

        List<Photo> photos = dtoList.stream().map(dto -> {
            checkAlbumExists(dto.getAlbumId());
            Photo photo = new Photo();
            BeanUtils.copyProperties(dto, photo);
            return photo;
        }).collect(Collectors.toList());

        return this.saveBatch(photos);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_PHOTO, allEntries = true)
    public Boolean updatePhoto(Long id, PhotoDTO dto) {
        Photo photo = this.getById(id);
        if (photo == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        checkAlbumExists(dto.getAlbumId());

        BeanUtils.copyProperties(dto, photo);
        photo.setId(id);

        return this.updateById(photo);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_PHOTO, allEntries = true)
    public Boolean deletePhoto(Long id) {
        Photo photo = this.getById(id);
        if (photo == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        return this.removeById(id);
    }

    /**
     * 校验相册是否存在
     */
    private void checkAlbumExists(Long albumId) {
        Album album = albumMapper.selectById(albumId);
        if (album == null) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "相册不存在");
        }
    }

    private PhotoVO convertToVO(Photo photo) {
        if (photo == null) {
            return null;
        }
        PhotoVO vo = new PhotoVO();
        vo.setId(photo.getId());
        vo.setAlbumId(photo.getAlbumId());
        vo.setPhotoSrc(photo.getPhotoSrc());
        vo.setPhotoAlt(photo.getPhotoAlt());
        vo.setPhotoWidth(photo.getPhotoWidth());
        vo.setPhotoHeight(photo.getPhotoHeight());
        vo.setPhotoTitle(photo.getPhotoTitle());
        vo.setPhotoLocation(photo.getPhotoLocation());
        vo.setPhotoDate(photo.getPhotoDate());
        vo.setSortOrder(photo.getSortOrder());
        vo.setCreateTime(photo.getCreateTime());
        return vo;
    }
}
