package com.seiko.blog.controller.blog;

import com.seiko.common.result.Result;
import com.seiko.blog.dto.CommentDTO;
import com.seiko.blog.service.CommentService;
import com.seiko.blog.vo.CommentVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 评论控制器
 */
@Tag(name = "评论模块", description = "评论管理相关接口")
@RestController
@RequestMapping("/api/blog/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    /**
     * 获取评论列表
     */
    @GetMapping
    @Operation(summary = "获取评论列表", description = "获取所有评论列表，按评论日期倒序排列")
    public Result<List<CommentVO>> getCommentList() {
        return Result.success(commentService.getCommentList());
    }

    /**
     * 获取评论详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取评论详情", description = "根据ID获取评论详情")
    public Result<CommentVO> getCommentById(
            @Parameter(description = "评论ID") @PathVariable Long id) {
        return Result.success(commentService.getCommentById(id));
    }

    /**
     * 根据文章ID获取评论列表
     */
    @GetMapping("/post/{postId}")
    @Operation(summary = "根据文章获取评论", description = "根据文章ID获取评论列表")
    public Result<List<CommentVO>> getCommentListByPostId(
            @Parameter(description = "文章ID") @PathVariable Long postId) {
        return Result.success(commentService.getCommentListByPostId(postId));
    }

    /**
     * 创建评论
     */
    @PostMapping
    @Operation(summary = "创建评论", description = "创建新的评论记录，需携带邮箱验证码")
    public Result<CommentVO> createComment(@Valid @RequestBody CommentDTO commentDTO) {
        return Result.success("创建成功", commentService.createComment(commentDTO));
    }
}
