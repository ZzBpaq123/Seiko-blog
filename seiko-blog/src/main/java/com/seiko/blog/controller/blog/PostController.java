package com.seiko.blog.controller.blog;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.result.Result;
import com.seiko.blog.service.PostService;
import com.seiko.blog.vo.PostVO;
import com.seiko.blog.vo.TagCountVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 文章控制器
 */
@RestController
@RequestMapping("/api/blog/posts")
@Tag(name = "文章管理", description = "文章列表、详情、标签相关接口")
public class PostController {

    @Autowired
    private PostService postService;

    /**
     * 获取文章列表
     */
    @GetMapping
    @Operation(summary = "获取文章列表", description = "分页获取已发布的文章列表，按发布时间倒序")
    public Result<Page<PostVO>> getPostList(
            @Parameter(description = "当前页码，默认1") @RequestParam(defaultValue = "1") long page,
            @Parameter(description = "每页大小，默认10") @RequestParam(defaultValue = "10") long size) {
        return Result.success(postService.getPostList(page, size, true, null, null));
    }

    /**
     * 根据slug获取文章详情
     */
    @GetMapping("/{slug}")
    @Operation(summary = "获取文章详情", description = "根据文章slug获取详情，同时阅读数+1")
    public Result<PostVO> getPostBySlug(
            @Parameter(description = "文章slug") @PathVariable String slug) {
        PostVO post = postService.getPostBySlug(slug);
        if (post == null) {
            return Result.error("文章不存在");
        }
        // 记录一次阅读，返回的阅读数 = 缓存基准值 + Redis 增量（缓存返回的是反序列化副本，修改不污染缓存）
        long readNum = postService.incrementReadCountAndGet(post.getId(), post.getReadNum() == null ? 0 : post.getReadNum());
        post.setReadNum((int) readNum);
        return Result.success(post);
    }

    /**
     * 获取所有标签
     */
    @GetMapping("/tags")
    @Operation(summary = "获取所有标签", description = "获取所有文章标签列表")
    public Result<List<String>> getAllTags() {
        return Result.success(postService.getAllTags());
    }

    /**
     * 根据标签获取文章
     */
    @GetMapping("/tag/{tag}")
    @Operation(summary = "根据标签获取文章", description = "根据标签名筛选文章")
    public Result<Page<PostVO>> getPostsByTag(
            @Parameter(description = "标签名") @PathVariable String tag,
            @Parameter(description = "当前页码，默认1") @RequestParam(defaultValue = "1") long page,
            @Parameter(description = "每页大小，默认10") @RequestParam(defaultValue = "10") long size) {
        return Result.success(postService.getPostsByTag(tag, page, size));
    }

    /**
     * 获取标签统计
     */
    @GetMapping("/tag-counts")
    @Operation(summary = "获取标签统计", description = "获取所有标签及其对应的文章数量")
    public Result<List<TagCountVO>> getTagCounts() {
        return Result.success(postService.getTagCounts());
    }
}
