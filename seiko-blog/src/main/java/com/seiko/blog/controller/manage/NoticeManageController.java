package com.seiko.blog.controller.manage;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.result.Result;
import com.seiko.blog.dto.NoticeDTO;
import com.seiko.blog.service.NoticeService;
import com.seiko.blog.vo.NoticeVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 公告管理控制器
 */
@Tag(name = "公告管理", description = "后台公告管理相关接口")
@RestController
@RequestMapping("/api/manage/notice")
@RequiredArgsConstructor
public class NoticeManageController {

    private final NoticeService noticeService;

    /**
     * 查询公告列表
     */
    @Operation(summary = "查询公告列表", description = "分页查询公告列表，支持标题模糊查询和启用状态过滤")
    @GetMapping("/list")
    public Result<Page<NoticeVO>> getNoticeList(
            @Parameter(description = "当前页码，默认1") @RequestParam(defaultValue = "1") long page,
            @Parameter(description = "每页大小，默认10") @RequestParam(defaultValue = "10") long size,
            @Parameter(description = "公告标题模糊查询") @RequestParam(required = false) String noticeTitle,
            @Parameter(description = "是否启用: true-启用, false-禁用") @RequestParam(required = false) Boolean enabled) {
        return Result.success(noticeService.getNoticePage(page, size, noticeTitle, enabled));
    }

    /**
     * 创建公告
     */
    @Operation(summary = "创建公告", description = "新建公告")
    @PostMapping
    public Result<Long> createNotice(@Valid @RequestBody NoticeDTO dto) {
        return Result.success("公告创建成功", noticeService.createNotice(dto));
    }

    /**
     * 更新公告
     */
    @Operation(summary = "更新公告", description = "根据ID更新公告")
    @PutMapping("/{id}")
    public Result<Boolean> updateNotice(
            @Parameter(description = "公告ID") @PathVariable Long id,
            @Valid @RequestBody NoticeDTO dto) {
        return Result.success("公告更新成功", noticeService.updateNotice(id, dto));
    }

    /**
     * 查询公告详情
     */
    @Operation(summary = "查询公告详情", description = "根据ID查询公告详情")
    @GetMapping("/{id}")
    public Result<NoticeVO> getNoticeById(
            @Parameter(description = "公告ID") @PathVariable Long id) {
        return Result.success(noticeService.getNoticeById(id));
    }

    /**
     * 删除公告
     */
    @Operation(summary = "删除公告", description = "根据ID删除公告")
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteNotice(
            @Parameter(description = "公告ID") @PathVariable Long id) {
        return Result.success("公告删除成功", noticeService.deleteNotice(id));
    }

    /**
     * 更新公告启用状态
     */
    @Operation(summary = "更新公告启用状态", description = "根据ID切换公告启用状态")
    @PatchMapping("/{id}/enabled")
    public Result<Boolean> updateNoticeEnabled(
            @Parameter(description = "公告ID") @PathVariable Long id,
            @Parameter(description = "是否启用: true-启用, false-禁用") @RequestParam Boolean enabled) {
        return Result.success("状态更新成功", noticeService.updateEnabled(id, enabled));
    }
}
