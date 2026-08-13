package com.seiko.blog.controller.manage;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.blog.service.CommentService;
import com.seiko.blog.vo.CommentVO;
import com.seiko.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 评论管理控制器
 */
@Tag(name = "评论管理", description = "后台评论管理相关接口")
@RestController
@RequestMapping("/api/manage/comment")
@RequiredArgsConstructor
public class CommentManageController {

    private final CommentService commentService;

    /**
     * 查询评论列表
     */
    @Operation(summary = "查询评论列表", description = "分页查询评论列表，支持评论作者模糊查询")
    @GetMapping("/list")
    public Result<Page<CommentVO>> getCommentList(
            @Parameter(description = "当前页码，默认1") @RequestParam(defaultValue = "1") long page,
            @Parameter(description = "每页大小，默认10") @RequestParam(defaultValue = "10") long size,
            @Parameter(description = "评论作者模糊查询") @RequestParam(required = false) String author) {
        return Result.success(commentService.getCommentPage(page, size, author));
    }

    /**
     * 查询评论详情
     */
    @Operation(summary = "查询评论详情", description = "根据ID查询评论详情")
    @GetMapping("/{id}")
    public Result<CommentVO> getCommentById(
            @Parameter(description = "评论ID") @PathVariable Long id) {
        return Result.success(commentService.getCommentById(id));
    }

    /**
     * 删除评论
     */
    @Operation(summary = "删除评论", description = "根据ID删除评论")
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteComment(
            @Parameter(description = "评论ID") @PathVariable Long id) {
        commentService.deleteComment(id);
        return Result.success("评论删除成功", true);
    }
}
