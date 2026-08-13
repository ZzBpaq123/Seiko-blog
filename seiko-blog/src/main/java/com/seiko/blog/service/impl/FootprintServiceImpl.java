package com.seiko.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.seiko.common.exception.BusinessException;
import com.seiko.common.result.ResultCode;
import com.seiko.blog.config.RedisCacheConfig;
import com.seiko.blog.dto.FootprintDTO;
import com.seiko.blog.entity.Footprint;
import com.seiko.blog.enums.FootprintType;
import com.seiko.blog.mapper.FootprintMapper;
import com.seiko.blog.service.FootprintService;
import com.seiko.blog.vo.FootprintVO;
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
 * 足迹服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FootprintServiceImpl extends ServiceImpl<FootprintMapper, Footprint> implements FootprintService {

    private final FootprintMapper footprintMapper;

    @Override
    @Cacheable(cacheNames = RedisCacheConfig.CACHE_FOOTPRINT, key = "'all'")
    public List<FootprintVO> getFootprintList() {
        return footprintMapper.selectList(
                new LambdaQueryWrapper<Footprint>()
                    .orderByDesc(Footprint::getId)
        ).stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    @Cacheable(cacheNames = RedisCacheConfig.CACHE_FOOTPRINT, key = "'id:' + #id", unless = "#result == null")
    public FootprintVO getFootprintById(Long id) {
        Footprint footprint = this.getById(id);
        if (footprint == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return convertToVO(footprint);
    }

    @Override
    @Cacheable(cacheNames = RedisCacheConfig.CACHE_FOOTPRINT, key = "'type:' + #type")
    public List<FootprintVO> getFootprintListByType(String type) {
        validateFootprintType(type);

        return footprintMapper.selectList(
                new LambdaQueryWrapper<Footprint>()
                    .eq(Footprint::getFootprintType, type)
                    .orderByDesc(Footprint::getId)
        ).stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    public Page<FootprintVO> getFootprintPage(long page, long size, String type, String city) {
        if (type != null && !type.isBlank()) {
            validateFootprintType(type);
        }

        Page<Footprint> footprintPage = new Page<>(page, size);
        LambdaQueryWrapper<Footprint> wrapper = new LambdaQueryWrapper<>();
        if (type != null && !type.isBlank()) {
            wrapper.eq(Footprint::getFootprintType, type);
        }
        if (city != null && !city.isBlank()) {
            wrapper.like(Footprint::getCity, city.trim());
        }
        wrapper.orderByDesc(Footprint::getFootprintDate);

        Page<Footprint> result = this.page(footprintPage, wrapper);

        List<FootprintVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        Page<FootprintVO> voPage = new Page<>();
        BeanUtils.copyProperties(result, voPage);
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_FOOTPRINT, allEntries = true)
    public Long createFootprint(FootprintDTO dto) {
        validateFootprintType(dto.getFootprintType());

        Footprint footprint = new Footprint();
        BeanUtils.copyProperties(dto, footprint);
        footprint.setCity(dto.getCity().trim());
        if (dto.getProvince() != null) {
            footprint.setProvince(dto.getProvince().trim());
        }
        footprint.setCountry(dto.getCountry().trim());
        footprint.setCountryCode(dto.getCountryCode().trim().toUpperCase());

        this.save(footprint);
        return footprint.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_FOOTPRINT, allEntries = true)
    public Boolean updateFootprint(Long id, FootprintDTO dto) {
        Footprint footprint = this.getById(id);
        if (footprint == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        validateFootprintType(dto.getFootprintType());

        BeanUtils.copyProperties(dto, footprint);
        footprint.setId(id);
        footprint.setCity(dto.getCity().trim());
        if (dto.getProvince() != null) {
            footprint.setProvince(dto.getProvince().trim());
        }
        footprint.setCountry(dto.getCountry().trim());
        footprint.setCountryCode(dto.getCountryCode().trim().toUpperCase());

        return this.updateById(footprint);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_FOOTPRINT, allEntries = true)
    public Boolean deleteFootprint(Long id) {
        Footprint footprint = this.getById(id);
        if (footprint == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        return this.removeById(id);
    }

    private void validateFootprintType(String type) {
        if (!FootprintType.isValid(type)) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "足迹类型必须是 domestic 或 international");
        }
    }

    private FootprintVO convertToVO(Footprint footprint) {
        if (footprint == null) {
            return null;
        }
        FootprintVO vo = new FootprintVO();
        BeanUtils.copyProperties(footprint, vo);
        return vo;
    }
}
