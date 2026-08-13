package com.seiko.blog.task;

import com.seiko.blog.entity.Log;
import com.seiko.blog.entity.User;
import com.seiko.blog.mapper.LogMapper;
import com.seiko.blog.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * 异步日志任务
 * <p>
 * 在新线程中执行日志入库，避免阻塞主业务流程
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AsyncLogTask {

    private final LogMapper logMapper;
    private final UserMapper userMapper;

    /**
     * 异步保存日志
     *
     * @param entity 日志实体
     */
    @Async("logExecutor")
    public void saveLog(Log entity) {
        try {
            // 补全用户名
            if (entity.getUserId() != null && entity.getUsername() == null) {
                User user = userMapper.selectById(entity.getUserId());
                if (user != null) {
                    entity.setUsername(user.getUsername());
                }
            }

            logMapper.insert(entity);
            log.debug("异步保存日志成功: {} - {}", entity.getLogType(), entity.getAction());
        } catch (Exception e) {
            log.error("异步保存日志失败: {} - {}", entity.getLogType(), entity.getAction(), e);
        }
    }
}
