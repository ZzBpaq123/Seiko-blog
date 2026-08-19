package com.seiko.blog.controller.manage;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.blog.service.LogService;
import com.seiko.blog.vo.LogVO;
import com.seiko.common.annotation.OperationLog;
import com.seiko.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 日志管理
 */
@Tag(name = "日志管理", description = "日志管理相关接口")
@RestController
@RequestMapping("/api/manage/log")
@RequiredArgsConstructor
public class LogManageController {

    private final LogService logService;

    /**
     * 获取日志列表
     */
    @OperationLog(action = "获取日志列表")
    @Operation(summary = "获取日志列表", description = "获取日志列表")
    @GetMapping("/list")
    public Result<Page<LogVO>> getLogList(
            @Parameter(description = "当前页码,默认1") @RequestParam(defaultValue = "") Long page,
            @Parameter(description = "每页大小,默认10") @RequestParam(defaultValue = "10") Long size,
            @Parameter(description = "日志类型") @RequestParam(defaultValue = "") String logType
    ) {
        return Result.success(logService.getLogList(page, size, logType));
    }
}
