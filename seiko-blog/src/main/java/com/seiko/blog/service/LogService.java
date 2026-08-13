package com.seiko.blog.service;

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
    List<LogVO> getLogList();

    /**
     * 根据日志类型获取日志列表
     *
     * @param logType 日志类型
     * @return 日志列表
     */
    List<LogVO> getLogListByType(String logType);

    /**
     * 根据日志级别获取日志列表
     *
     * @param logLevel 日志级别
     * @return 日志列表
     */
    List<LogVO> getLogListByLevel(String logLevel);

    /**
     * 获取日志详情
     *
     * @param id 日志ID
     * @return 日志详情
     */
    LogVO getLogById(Long id);

    /**
     * 创建日志
     *
     * @param logDTO 日志信息
     * @return 创建的日志
     */
    LogVO createLog(LogDTO logDTO);

    /**
     * 删除日志
     *
     * @param id 日志ID
     */
    void deleteLog(Long id);
}
