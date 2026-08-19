package com.seiko.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.exception.BusinessException;
import com.seiko.blog.dto.LogDTO;
import com.seiko.blog.entity.Log;
import com.seiko.blog.mapper.LogMapper;
import com.seiko.blog.service.LogService;
import com.seiko.blog.vo.LogVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 日志服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LogServiceImpl implements LogService {

    private final LogMapper logMapper;

    @Override
    public Page<LogVO> getLogList(long pageNum, long pageSize, String logType) {
        Page<Log> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Log> wrapper = new LambdaQueryWrapper<Log>()
                .orderByDesc(Log::getCreateTime);
        if (logType != null && !logType.isEmpty()) {
            wrapper.eq(Log::getLogType, logType);
        }
        Page<Log> entityPage = logMapper.selectPage(page, wrapper);

        List<LogVO> records = entityPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        Page<LogVO> resultPage = new Page<>(entityPage.getCurrent(), entityPage.getSize(), entityPage.getTotal());
        resultPage.setRecords(records);
        return resultPage;
    }

    @Override
    public LogVO getLogById(Long id) {
        Log entity = logMapper.selectById(id);
        if (entity == null || entity.getIsDeleted() == 1) {
            throw new BusinessException(500, "日志不存在");
        }
        return convertToVO(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteLog(Long id) {
        Log entity = logMapper.selectById(id);
        if (entity == null || entity.getIsDeleted() == 1) {
            throw new BusinessException(500, "日志不存在");
        }

        logMapper.deleteById(id);
        log.info("删除日志: {} - {}", entity.getLogType(), entity.getAction());
    }

    private LogVO convertToVO(Log entity) {
        if (entity == null) {
            return null;
        }
        LogVO vo = new LogVO();
        vo.setId(entity.getId());
        vo.setLogType(entity.getLogType());
        vo.setLogLevel(entity.getLogLevel());
        vo.setAction(entity.getAction());
        vo.setDescription(entity.getDescription());
        vo.setUserId(entity.getUserId());
        vo.setUsername(entity.getUsername());
        vo.setIpAddress(entity.getIpAddress());
        vo.setUserAgent(entity.getUserAgent());
        vo.setRequestMethod(entity.getRequestMethod());
        vo.setMethod(entity.getMethod());
        vo.setRequestUrl(entity.getRequestUrl());
        vo.setRequestParams(entity.getRequestParams());
        vo.setJsonResult(entity.getJsonResult());
        vo.setResponseCode(entity.getResponseCode());
        vo.setStatus(entity.getStatus());
        vo.setCostTime(entity.getCostTime());
        vo.setErrorMessage(entity.getErrorMessage());
        vo.setCreateTime(entity.getCreateTime());
        return vo;
    }

    private Log convertToEntity(LogDTO dto) {
        Log entity = new Log();
        entity.setLogType(dto.getLogType());
        entity.setLogLevel(dto.getLogLevel());
        entity.setAction(dto.getAction());
        entity.setDescription(dto.getDescription());
        entity.setUserId(dto.getUserId());
        entity.setUsername(dto.getUsername());
        entity.setIpAddress(dto.getIpAddress());
        entity.setUserAgent(dto.getUserAgent());
        entity.setRequestMethod(dto.getRequestMethod());
        entity.setMethod(dto.getMethod());
        entity.setRequestUrl(dto.getRequestUrl());
        entity.setRequestParams(dto.getRequestParams());
        entity.setJsonResult(dto.getJsonResult());
        entity.setResponseCode(dto.getResponseCode());
        entity.setStatus(dto.getStatus());
        entity.setCostTime(dto.getCostTime());
        entity.setErrorMessage(dto.getErrorMessage());
        return entity;
    }
}
