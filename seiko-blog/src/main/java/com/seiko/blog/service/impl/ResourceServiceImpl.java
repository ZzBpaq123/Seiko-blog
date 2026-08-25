package com.seiko.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.constant.RedisConstant;
import com.seiko.common.exception.BusinessException;
import com.seiko.common.result.ResultCode;
import com.seiko.blog.config.RedisCacheConfig;
import com.seiko.blog.dto.ResourceDTO;
import com.seiko.blog.entity.Resource;
import com.seiko.blog.mapper.ResourceMapper;
import com.seiko.blog.service.ResourceService;
import com.seiko.blog.vo.ResourceGroupVO;
import com.seiko.blog.vo.ResourceVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 资源服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceMapper resourceMapper;

    /** 无分类资源的默认分组名称 */
    private static final String UNCATEGORIZED = "未分类";

    @Override
    @Cacheable(cacheNames = RedisConstant.CACHE_RESOURCE, key = "'groups'")
    public List<ResourceGroupVO> getEnabledResourceGroups() {
        List<Resource> resources = resourceMapper.selectList(
                new LambdaQueryWrapper<Resource>()
                        .eq(Resource::getEnabled, true)
                        .orderByAsc(Resource::getSortOrder)
                        .orderByDesc(Resource::getId)
        );

        // 按分类聚合，保持查询的排序顺序（LinkedHashMap）
        Map<String, ResourceGroupVO> groupMap = new LinkedHashMap<>();
        for (Resource resource : resources) {
            String category = (resource.getCategory() == null || resource.getCategory().isBlank())
                    ? UNCATEGORIZED
                    : resource.getCategory();
            ResourceGroupVO group = groupMap.computeIfAbsent(category, key -> {
                ResourceGroupVO vo = new ResourceGroupVO();
                vo.setCategory(key);
                vo.setResources(new ArrayList<>());
                return vo;
            });
            group.getResources().add(convertToVO(resource));
        }

        return new ArrayList<>(groupMap.values());
    }

    @Override
    public ResourceVO getResourceById(Long id) {
        Resource resource = resourceMapper.selectById(id);
        if (resource == null || resource.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return convertToVO(resource);
    }

    @Override
    public Page<ResourceVO> getResourcePage(long page, long size, String resourceName, String category, Boolean enabled) {
        Page<Resource> resourcePage = new Page<>(page, size);
        LambdaQueryWrapper<Resource> wrapper = new LambdaQueryWrapper<Resource>();
        if (resourceName != null && !resourceName.isBlank()) {
            wrapper.like(Resource::getResourceName, resourceName.trim());
        }
        if (category != null && !category.isBlank()) {
            wrapper.eq(Resource::getCategory, category.trim());
        }
        if (enabled != null) {
            wrapper.eq(Resource::getEnabled, enabled);
        }
        wrapper.orderByAsc(Resource::getSortOrder).orderByDesc(Resource::getId);

        Page<Resource> result = resourceMapper.selectPage(resourcePage, wrapper);

        List<ResourceVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        Page<ResourceVO> voPage = new Page<>();
        BeanUtils.copyProperties(result, voPage);
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisConstant.CACHE_RESOURCE, allEntries = true)
    public Long createResource(ResourceDTO dto) {
        Resource resource = new Resource();
        BeanUtils.copyProperties(dto, resource);
        if (resource.getEnabled() == null) {
            resource.setEnabled(true);
        }
        if (resource.getSortOrder() == null) {
            resource.setSortOrder(0);
        }
        resourceMapper.insert(resource);
        return resource.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisConstant.CACHE_RESOURCE, allEntries = true)
    public Boolean updateResource(Long id, ResourceDTO dto) {
        Resource resource = resourceMapper.selectById(id);
        if (resource == null || resource.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        BeanUtils.copyProperties(dto, resource);
        resource.setId(id);
        return resourceMapper.updateById(resource) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisConstant.CACHE_RESOURCE, allEntries = true)
    public Boolean deleteResource(Long id) {
        Resource resource = resourceMapper.selectById(id);
        if (resource == null || resource.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        return resourceMapper.deleteById(id) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisConstant.CACHE_RESOURCE, allEntries = true)
    public Boolean updateEnabled(Long id, Boolean enabled) {
        Resource resource = resourceMapper.selectById(id);
        if (resource == null || resource.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        resource.setEnabled(enabled);
        return resourceMapper.updateById(resource) > 0;
    }

    private ResourceVO convertToVO(Resource resource) {
        if (resource == null) {
            return null;
        }
        ResourceVO vo = new ResourceVO();
        vo.setId(resource.getId());
        vo.setResourceName(resource.getResourceName());
        vo.setResourceUrl(resource.getResourceUrl());
        vo.setCategory(resource.getCategory());
        vo.setDescription(resource.getDescription());
        vo.setSortOrder(resource.getSortOrder());
        vo.setEnabled(resource.getEnabled());
        vo.setCreateTime(resource.getCreateTime());
        return vo;
    }
}
