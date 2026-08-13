package com.seiko.blog.controller.blog;

import com.seiko.common.result.Result;
import com.seiko.blog.service.NoticeService;
import com.seiko.blog.vo.NoticeVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 公告控制器
 */
@Tag(name = "公告模块", description = "公告管理相关接口")
@RestController
@RequestMapping("/api/blog/notice")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    /**
     * 获取已启用的公告列表
     */
    @GetMapping("/enabled")
    @Operation(summary = "获取已启用公告", description = "获取已启用的公告列表（用于前台展示）")
    public Result<List<NoticeVO>> getEnabledNoticeList() {
        return Result.success(noticeService.getEnabledNoticeList());
    }

    /**
     * 获取公告详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取公告详情", description = "根据ID获取公告详情")
    public Result<NoticeVO> getNoticeById(
            @Parameter(description = "公告ID") @PathVariable Long id) {
        return Result.success(noticeService.getNoticeById(id));
    }
}
