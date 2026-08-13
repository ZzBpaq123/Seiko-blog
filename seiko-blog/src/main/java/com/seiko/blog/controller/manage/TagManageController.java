package com.seiko.blog.controller.manage;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.result.Result;
import com.seiko.blog.dto.TagDTO;
import com.seiko.blog.service.TagService;
import com.seiko.blog.vo.TagVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 标签管理控制器
 */
@Tag(name = "标签管理", description = "后台标签管理相关接口")
@RestController
@RequestMapping("/api/manage/tag")
@RequiredArgsConstructor
public class TagManageController {

    private final TagService tagService;

    /**
     * 查询标签列表
     */
    @Operation(summary = "查询标签列表", description = "分页查询标签列表，支持名称/标识模糊查询")
    @GetMapping("/list")
    public Result<Page<TagVO>> getTagList(
            @Parameter(description = "当前页码，默认1") @RequestParam(defaultValue = "1") long page,
            @Parameter(description = "每页大小，默认10") @RequestParam(defaultValue = "10") long size,
            @Parameter(description = "名称/标识模糊查询") @RequestParam(required = false) String keyword) {
        return Result.success(tagService.getTagPage(page, size, keyword));
    }

    /**
     * 创建标签
     */
    @Operation(summary = "创建标签", description = "新建标签，slug 为空时根据名称自动生成")
    @PostMapping
    public Result<Long> createTag(@Valid @RequestBody TagDTO dto) {
        return Result.success("标签创建成功", tagService.createTag(dto));
    }

    /**
     * 更新标签
     */
    @Operation(summary = "更新标签", description = "根据ID更新标签")
    @PutMapping("/{id}")
    public Result<Boolean> updateTag(
            @Parameter(description = "标签ID") @PathVariable Long id,
            @Valid @RequestBody TagDTO dto) {
        return Result.success("标签更新成功", tagService.updateTag(id, dto));
    }

    /**
     * 查询标签详情
     */
    @Operation(summary = "查询标签详情", description = "根据ID查询标签详情")
    @GetMapping("/{id}")
    public Result<TagVO> getTagById(
            @Parameter(description = "标签ID") @PathVariable Long id) {
        return Result.success(tagService.getTagById(id));
    }

    /**
     * 删除标签
     */
    @Operation(summary = "删除标签", description = "根据ID删除标签，已关联文章的标签不允许删除")
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteTag(
            @Parameter(description = "标签ID") @PathVariable Long id) {
        return Result.success("标签删除成功", tagService.deleteTag(id));
    }
}
