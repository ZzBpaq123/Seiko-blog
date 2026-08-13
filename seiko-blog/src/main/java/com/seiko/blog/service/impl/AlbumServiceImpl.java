package com.seiko.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.seiko.common.exception.BusinessException;
import com.seiko.common.result.ResultCode;
import com.seiko.blog.config.RedisCacheConfig;
import com.seiko.blog.dto.AlbumDTO;
import com.seiko.blog.entity.Album;
import com.seiko.blog.entity.Photo;
import com.seiko.blog.mapper.AlbumMapper;
import com.seiko.blog.mapper.PhotoMapper;
import com.seiko.blog.service.AlbumService;
import com.seiko.blog.vo.AlbumVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
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
public class AlbumServiceImpl extends ServiceImpl<AlbumMapper, Album> implements AlbumService {

    private final AlbumMapper albumMapper;
    private final PhotoMapper photoMapper;

    @Override
    @Cacheable(cacheNames = RedisCacheConfig.CACHE_ALBUM, key = "'all'")
    public List<AlbumVO> getAlbumList() {
        return albumMapper.selectList(
                new LambdaQueryWrapper<Album>()
                    .orderByDesc(Album::getCreateTime)
        ).stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    public Page<AlbumVO> getAlbumPage(long page, long size, String albumName) {
        Page<Album> albumPage = new Page<>(page, size);
        LambdaQueryWrapper<Album> wrapper = new LambdaQueryWrapper<>();
        if (albumName != null && !albumName.isBlank()) {
            wrapper.like(Album::getAlbumName, albumName.trim());
        }
        wrapper.orderByDesc(Album::getCreateTime);

        Page<Album> result = this.page(albumPage, wrapper);

        List<AlbumVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        Page<AlbumVO> voPage = new Page<>();
        BeanUtils.copyProperties(result, voPage);
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    public AlbumVO getAlbumById(Long id) {
        Album album = this.getById(id);
        if (album == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return convertToVO(album);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_ALBUM, allEntries = true)
    public Long createAlbum(AlbumDTO dto) {
        Album album = new Album();
        BeanUtils.copyProperties(dto, album);
        album.setAlbumName(dto.getAlbumName().trim());

        this.save(album);
        return album.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_ALBUM, allEntries = true)
    public Boolean updateAlbum(Long id, AlbumDTO dto) {
        Album album = this.getById(id);
        if (album == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        BeanUtils.copyProperties(dto, album);
        album.setId(id);
        album.setAlbumName(dto.getAlbumName().trim());

        return this.updateById(album);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @Caching(evict = {
            @CacheEvict(cacheNames = RedisCacheConfig.CACHE_ALBUM, allEntries = true),
            @CacheEvict(cacheNames = RedisCacheConfig.CACHE_PHOTO, allEntries = true)
    })
    public Boolean deleteAlbum(Long id) {
        Album album = this.getById(id);
        if (album == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        // 同时删除相册下的照片
        photoMapper.delete(
                new LambdaQueryWrapper<Photo>()
                    .eq(Photo::getAlbumId, id)
        );

        return this.removeById(id);
    }

    private AlbumVO convertToVO(Album album) {
        if (album == null) {
            return null;
        }
        AlbumVO vo = new AlbumVO();
        vo.setId(album.getId());
        vo.setAlbumName(album.getAlbumName());
        vo.setAlbumDesc(album.getAlbumDesc());
        vo.setAlbumCover(album.getAlbumCover());
        vo.setAlbumTime(album.getAlbumTime());
        return vo;
    }
}
