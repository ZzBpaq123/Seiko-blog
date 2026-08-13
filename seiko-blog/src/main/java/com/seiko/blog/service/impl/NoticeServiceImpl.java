package com.seiko.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.exception.BusinessException;
import com.seiko.common.result.ResultCode;
import com.seiko.blog.config.RedisCacheConfig;
import com.seiko.blog.dto.NoticeDTO;
import com.seiko.blog.entity.Notice;
import com.seiko.blog.mapper.NoticeMapper;
import com.seiko.blog.service.NoticeService;
import com.seiko.blog.vo.NoticeVO;
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
 * 公告服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {

    private final NoticeMapper noticeMapper;

    @Override
    @Cacheable(cacheNames = RedisCacheConfig.CACHE_NOTICE, key = "'enabled'")
    public List<NoticeVO> getEnabledNoticeList() {
        return noticeMapper.selectList(
                new LambdaQueryWrapper<Notice>()
                    .eq(Notice::getEnabled, true)
                    .orderByAsc(Notice::getSortOrder)
                    .orderByDesc(Notice::getId)
        ).stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    @Cacheable(cacheNames = RedisCacheConfig.CACHE_NOTICE, key = "'id:' + #id", unless = "#result == null")
    public NoticeVO getNoticeById(Long id) {
        Notice notice = noticeMapper.selectById(id);
        if (notice == null || notice.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return convertToVO(notice);
    }

    @Override
    public Page<NoticeVO> getNoticePage(long page, long size, String noticeTitle, Boolean enabled) {
        Page<Notice> noticePage = new Page<>(page, size);
        LambdaQueryWrapper<Notice> wrapper = new LambdaQueryWrapper<Notice>();
        if (noticeTitle != null && !noticeTitle.isBlank()) {
            wrapper.like(Notice::getNoticeTitle, noticeTitle.trim());
        }
        if (enabled != null) {
            wrapper.eq(Notice::getEnabled, enabled);
        }
        wrapper.orderByAsc(Notice::getSortOrder).orderByDesc(Notice::getId);

        Page<Notice> result = noticeMapper.selectPage(noticePage, wrapper);

        List<NoticeVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        Page<NoticeVO> voPage = new Page<>();
        BeanUtils.copyProperties(result, voPage);
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_NOTICE, allEntries = true)
    public Long createNotice(NoticeDTO dto) {
        Notice notice = new Notice();
        BeanUtils.copyProperties(dto, notice);
        if (notice.getEnabled() == null) {
            notice.setEnabled(true);
        }
        if (notice.getSortOrder() == null) {
            notice.setSortOrder(0);
        }
        noticeMapper.insert(notice);
        return notice.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_NOTICE, allEntries = true)
    public Boolean updateNotice(Long id, NoticeDTO dto) {
        Notice notice = noticeMapper.selectById(id);
        if (notice == null || notice.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        BeanUtils.copyProperties(dto, notice);
        notice.setId(id);
        return noticeMapper.updateById(notice) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_NOTICE, allEntries = true)
    public Boolean deleteNotice(Long id) {
        Notice notice = noticeMapper.selectById(id);
        if (notice == null || notice.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        return noticeMapper.deleteById(id) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_NOTICE, allEntries = true)
    public Boolean updateEnabled(Long id, Boolean enabled) {
        Notice notice = noticeMapper.selectById(id);
        if (notice == null || notice.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        notice.setEnabled(enabled);
        return noticeMapper.updateById(notice) > 0;
    }

    private NoticeVO convertToVO(Notice notice) {
        if (notice == null) {
            return null;
        }
        NoticeVO vo = new NoticeVO();
        vo.setId(notice.getId());
        vo.setNoticeTitle(notice.getNoticeTitle());
        vo.setNoticeContent(notice.getNoticeContent());
        vo.setNoticeLink(notice.getNoticeLink());
        vo.setSortOrder(notice.getSortOrder());
        vo.setEnabled(notice.getEnabled());
        vo.setCreateTime(notice.getCreateTime());
        return vo;
    }
}
