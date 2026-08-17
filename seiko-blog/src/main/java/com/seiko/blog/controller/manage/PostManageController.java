package com.seiko.blog.controller.manage;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.annotation.OperationLog;
import com.seiko.common.result.Result;
import com.seiko.blog.dto.PostDTO;
import com.seiko.blog.service.PostService;
import com.seiko.blog.vo.PostVO;
import com.seiko.blog.vo.TagVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 文章管理控制器
 */
@Tag(name = "文章管理", description = "后台文章管理相关接口")
@RestController
@RequestMapping("/api/manage/post")
@RequiredArgsConstructor
public class PostManageController {

    private final PostService postService;

    /**
     * 查询文章列表
     */
    @OperationLog(action = "查询文章列表")
    @Operation(summary = "查询文章列表", description = "查询所有文章列表，支持标题模糊查询、发布状态过滤和标签过滤")
    @GetMapping("/list")
    public Result<Page<PostVO>> getPostList(
            @Parameter(description = "当前页码，默认1") @RequestParam(defaultValue = "1") long page,
            @Parameter(description = "每页大小，默认10") @RequestParam(defaultValue = "10") long size,
            @Parameter(description = "文章标题模糊查询") @RequestParam(required = false) String title,
            @Parameter(description = "是否发布: true-已发布, false-草稿") @RequestParam(required = false) Boolean published,
            @Parameter(description = "标签名称") @RequestParam(required = false) String tag) {
        return Result.success(postService.getPostList(page, size, published, title, tag));
    }

    /**
     * 创建文章
     */
    @OperationLog(action = "创建文章")
    @Operation(summary = "创建文章", description = "新建文章，支持标签自动创建，slug 为空时根据标题生成")
    @PostMapping
    public Result<Long> createPost(@Valid @RequestBody PostDTO dto) {
        return Result.success("文章创建成功", postService.createPost(dto));
    }

    /**
     * 更新文章
     */
    @OperationLog(action = "更新文章")
    @Operation(summary = "更新文章", description = "根据ID更新文章，标签会全量替换")
    @PutMapping("/{id}")
    public Result<Boolean> updatePost(
            @Parameter(description = "文章ID") @PathVariable Long id,
            @Valid @RequestBody PostDTO dto) {
        return Result.success("文章更新成功", postService.updatePost(id, dto));
    }

    /**
     * 查询文章详情
     */
    @OperationLog(action = "查询文章详情")
    @Operation(summary = "查询文章详情", description = "根据ID查询文章详情")
    @GetMapping("/{id}")
    public Result<PostVO> getPostById(
            @Parameter(description = "文章ID") @PathVariable Long id) {
        return Result.success(postService.getPostById(id));
    }

    /**
     * 删除文章
     */
    @OperationLog(action = "删除文章")
    @Operation(summary = "删除文章", description = "根据ID删除文章，同时移除文章标签关联")
    @DeleteMapping("/{id}")
    public Result<Boolean> deletePost(
            @Parameter(description = "文章ID") @PathVariable Long id) {
        return Result.success("文章删除成功", postService.deletePost(id));
    }

}
