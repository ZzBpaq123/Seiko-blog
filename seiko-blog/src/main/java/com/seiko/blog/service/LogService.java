package com.seiko.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.blog.dto.LogDTO;
import com.seiko.blog.vo.LogVO;

import java.util.List;

/**
 * 日志服务接口
 */
public interface LogService {

    /**
     * 获取日志列表
     *
     * @return 日志列表
     */
    Page<LogVO> getLogList(long page, long size, String logType);

    /**
     * 获取日志详情
     *
     * @param id 日志ID
     * @return 日志详情
     */
    LogVO getLogById(Long id);

    /**
     * 删除日志
     *
     * @param id 日志ID
     */
    void deleteLog(Long id);
}
