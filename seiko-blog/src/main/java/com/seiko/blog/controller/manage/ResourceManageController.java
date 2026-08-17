package com.seiko.blog.controller.manage;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.annotation.OperationLog;
import com.seiko.common.result.Result;
import com.seiko.blog.dto.ResourceDTO;
import com.seiko.blog.service.ResourceService;
import com.seiko.blog.vo.ResourceVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 资源管理控制器
 */
@Tag(name = "资源管理", description = "后台资源管理相关接口")
@RestController
@RequestMapping("/api/manage/resource")
@RequiredArgsConstructor
public class ResourceManageController {

    private final ResourceService resourceService;

    /**
     * 查询资源列表
     */
    @OperationLog(action = "查询资源列表")
    @Operation(summary = "查询资源列表", description = "分页查询资源列表，支持资源名称模糊查询、分类和启用状态过滤")
    @GetMapping("/list")
    public Result<Page<ResourceVO>> getResourceList(
            @Parameter(description = "当前页码，默认1") @RequestParam(defaultValue = "1") long page,
            @Parameter(description = "每页大小，默认10") @RequestParam(defaultValue = "10") long size,
            @Parameter(description = "资源名称模糊查询") @RequestParam(required = false) String resourceName,
            @Parameter(description = "资源分类") @RequestParam(required = false) String category,
            @Parameter(description = "是否启用: true-启用, false-禁用") @RequestParam(required = false) Boolean enabled) {
        return Result.success(resourceService.getResourcePage(page, size, resourceName, category, enabled));
    }

    /**
     * 创建资源
     */
    @OperationLog(action = "创建资源")
    @Operation(summary = "创建资源", description = "新建资源")
    @PostMapping
    public Result<Long> createResource(@Valid @RequestBody ResourceDTO dto) {
        return Result.success("资源创建成功", resourceService.createResource(dto));
    }

    /**
     * 更新资源
     */
    @OperationLog(action = "更新资源")
    @Operation(summary = "更新资源", description = "根据ID更新资源")
    @PutMapping("/{id}")
    public Result<Boolean> updateResource(
            @Parameter(description = "资源ID") @PathVariable Long id,
            @Valid @RequestBody ResourceDTO dto) {
        return Result.success("资源更新成功", resourceService.updateResource(id, dto));
    }

    /**
     * 查询资源详情
     */
    @OperationLog(action = "查询资源详情")
    @Operation(summary = "查询资源详情", description = "根据ID查询资源详情")
    @GetMapping("/{id}")
    public Result<ResourceVO> getResourceById(
            @Parameter(description = "资源ID") @PathVariable Long id) {
        return Result.success(resourceService.getResourceById(id));
    }

    /**
     * 删除资源
     */
    @OperationLog(action = "删除资源")
    @Operation(summary = "删除资源", description = "根据ID删除资源")
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteResource(
            @Parameter(description = "资源ID") @PathVariable Long id) {
        return Result.success("资源删除成功", resourceService.deleteResource(id));
    }

    /**
     * 更新资源启用状态
     */
    @OperationLog(action = "更新资源启用状态")
    @Operation(summary = "更新资源启用状态", description = "根据ID切换资源启用状态")
    @PatchMapping("/{id}/enabled")
    public Result<Boolean> updateResourceEnabled(
            @Parameter(description = "资源ID") @PathVariable Long id,
            @Parameter(description = "是否启用: true-启用, false-禁用") @RequestParam Boolean enabled) {
        return Result.success("状态更新成功", resourceService.updateEnabled(id, enabled));
    }
}
