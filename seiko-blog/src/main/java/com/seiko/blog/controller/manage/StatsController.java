package com.seiko.blog.controller.manage;

import com.seiko.common.annotation.OperationLog;
import com.seiko.common.result.Result;
import com.seiko.blog.service.StatsService;
import com.seiko.blog.vo.CreationTrendVO;
import com.seiko.blog.vo.ReadTrendVO;
import com.seiko.blog.vo.StatsVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 数据统计控制器
 */
@Tag(name = "数据统计", description = "后台数据统计相关接口")
@RestController
@RequestMapping("/api/manage/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    /**
     * 获取数据统计概览
     *
     * @return 各模块数量及文章阅读量等统计数据
     */
    @OperationLog(action = "获取数据统计概览")
    @Operation(summary = "获取数据统计概览", description = "统计已发布文章数、评论总数、相册数、照片数及文章阅读总量")
    @GetMapping
    public Result<StatsVO> getStats() {
        return Result.success(statsService.getStats());
    }

    /**
     * 获取阅读量趋势
     *
     * @param days 统计天数，默认 7，最大 30
     * @return 近 N 天每日阅读次数
     */
    @OperationLog(action = "获取阅读量趋势")
    @Operation(summary = "获取阅读量趋势", description = "按天统计近 N 天文章详情访问次数，默认 7 天，最大 30 天")
    @GetMapping("/read-trend")
    public Result<List<ReadTrendVO>> getReadTrend(
            @Parameter(description = "统计天数，默认 7，最大 30") @RequestParam(defaultValue = "7") int days) {
        if (days < 1 || days > 30) {
            return Result.error("统计天数范围为 1-30");
        }
        return Result.success(statsService.getReadTrend(days));
    }

    /**
     * 获取内容新建趋势
     *
     * @param days 统计天数，默认 7，最大 30
     * @return 近 N 天每日新建文章、相册、照片数量
     */
    @OperationLog(action = "获取内容新建趋势")
    @Operation(summary = "获取内容新建趋势", description = "按天统计近 N 天新建文章数、新建相册数、新增照片数，默认 7 天，最大 30 天")
    @GetMapping("/creation-trend")
    public Result<List<CreationTrendVO>> getCreationTrend(
            @Parameter(description = "统计天数，默认 7，最大 30") @RequestParam(defaultValue = "7") int days) {
        if (days < 1 || days > 30) {
            return Result.error("统计天数范围为 1-30");
        }
        return Result.success(statsService.getCreationTrend(days));
    }
}
