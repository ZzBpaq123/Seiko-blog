package com.seiko.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.exception.BusinessException;
import com.seiko.common.result.ResultCode;
import com.seiko.blog.config.RedisCacheConfig;
import com.seiko.blog.dto.TagDTO;
import com.seiko.blog.entity.PostTag;
import com.seiko.blog.entity.Tag;
import com.seiko.blog.mapper.PostTagMapper;
import com.seiko.blog.mapper.TagMapper;
import com.seiko.blog.service.TagService;
import com.seiko.blog.vo.TagVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 标签服务实现
 */
@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagMapper tagMapper;
    private final PostTagMapper postTagMapper;

    @Override
    @Cacheable(cacheNames = RedisCacheConfig.CACHE_TAG,
            key = "'page:' + #page + ':' + #size + ':' + (#keyword ?: '')")
    public Page<TagVO> getTagPage(long page, long size, String keyword) {
        Page<Tag> tagPage = new Page<>(page, size);
        LambdaQueryWrapper<Tag> wrapper = new LambdaQueryWrapper<Tag>()
                .eq(Tag::getIsDeleted, 0);

        if (StringUtils.hasText(keyword)) {
            String value = keyword.trim();
            wrapper.and(w -> w.like(Tag::getName, value).or().like(Tag::getSlug, value));
        }
        wrapper.orderByDesc(Tag::getId);

        Page<Tag> result = tagMapper.selectPage(tagPage, wrapper);
        List<TagVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        Page<TagVO> voPage = new Page<>();
        BeanUtils.copyProperties(result, voPage);
        voPage.setRecords(voList);
        return voPage;
    }

    @Override
    public TagVO getTagById(Long id) {
        Tag tag = tagMapper.selectById(id);
        if (tag == null || tag.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return convertToVO(tag);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = {RedisCacheConfig.CACHE_TAG, RedisCacheConfig.CACHE_POST}, allEntries = true)
    public Long createTag(TagDTO dto) {
        String name = dto.getName().trim();
        String slug = resolveSlug(dto.getSlug(), name);

        assertTagNameUnique(name, null);
        assertTagSlugUnique(slug, null);

        Tag tag = new Tag();
        tag.setName(name);
        tag.setSlug(slug);
        tagMapper.insert(tag);
        return tag.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = {RedisCacheConfig.CACHE_TAG, RedisCacheConfig.CACHE_POST}, allEntries = true)
    public Boolean updateTag(Long id, TagDTO dto) {
        Tag tag = tagMapper.selectById(id);
        if (tag == null || tag.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        String name = dto.getName().trim();
        String slug = resolveSlug(dto.getSlug(), name);

        assertTagNameUnique(name, id);
        assertTagSlugUnique(slug, id);

        tag.setName(name);
        tag.setSlug(slug);
        return tagMapper.updateById(tag) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = {RedisCacheConfig.CACHE_TAG, RedisCacheConfig.CACHE_POST}, allEntries = true)
    public Boolean deleteTag(Long id) {
        Tag tag = tagMapper.selectById(id);
        if (tag == null || tag.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        long refCount = postTagMapper.selectCount(
                new LambdaQueryWrapper<PostTag>().eq(PostTag::getTagId, id));
        if (refCount > 0) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(),
                    "该标签已关联 " + refCount + " 篇文章，请先解除关联再删除");
        }

        return tagMapper.deleteById(id) > 0;
    }

    private TagVO convertToVO(Tag tag) {
        TagVO vo = new TagVO();
        BeanUtils.copyProperties(tag, vo);
        return vo;
    }

    private String resolveSlug(String slug, String name) {
        if (StringUtils.hasText(slug)) {
            return slug.trim();
        }
        return generateSlug(name);
    }

    private String generateSlug(String text) {
        String slug = text.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        if (slug.isBlank()) {
            slug = "tag-" + System.currentTimeMillis();
        }
        return slug;
    }

    private void assertTagNameUnique(String name, Long excludeId) {
        LambdaQueryWrapper<Tag> wrapper = new LambdaQueryWrapper<Tag>()
                .eq(Tag::getName, name)
                .eq(Tag::getIsDeleted, 0);
        if (excludeId != null) {
            wrapper.ne(Tag::getId, excludeId);
        }
        if (tagMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "标签名称已存在");
        }
    }

    private void assertTagSlugUnique(String slug, Long excludeId) {
        LambdaQueryWrapper<Tag> wrapper = new LambdaQueryWrapper<Tag>()
                .eq(Tag::getSlug, slug)
                .eq(Tag::getIsDeleted, 0);
        if (excludeId != null) {
            wrapper.ne(Tag::getId, excludeId);
        }
        if (tagMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "标签标识已存在");
        }
    }
}
