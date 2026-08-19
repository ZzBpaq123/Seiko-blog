package com.seiko.blog.controller.manage;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.blog.dto.DictItemDTO;
import com.seiko.blog.dto.DictTypeDTO;
import com.seiko.blog.service.DictService;
import com.seiko.blog.vo.DictItemVO;
import com.seiko.blog.vo.DictTypeVO;
import com.seiko.common.annotation.OperationLog;
import com.seiko.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 字典管理
 */
@Tag(name = "字典管理", description = "字典类型与字典项管理相关接口")
@RestController
@RequestMapping("/api/manage/dict")
@RequiredArgsConstructor
public class DictManageController {

    private final DictService dictService;

    // ─── 字典类型 ───

    /**
     * 分页查询字典类型列表
     */
    @OperationLog(action = "查询字典类型列表")
    @Operation(summary = "分页查询字典类型", description = "支持编码/名称模糊查询与启用状态过滤")
    @GetMapping("/type/list")
    public Result<Page<DictTypeVO>> getTypeList(
            @Parameter(description = "当前页码,默认1") @RequestParam(defaultValue = "1") long page,
            @Parameter(description = "每页大小,默认10") @RequestParam(defaultValue = "10") long size,
            @Parameter(description = "类型编码/名称模糊查询") @RequestParam(required = false) String keyword,
            @Parameter(description = "是否启用: true-启用 false-停用") @RequestParam(required = false) Boolean enabled) {
        return Result.success(dictService.getTypePage(page, size, keyword, enabled));
    }

    /**
     * 查询字典类型详情
     */
    @OperationLog(action = "查询字典类型详情")
    @Operation(summary = "查询字典类型详情", description = "根据ID查询字典类型")
    @GetMapping("/type/{id}")
    public Result<DictTypeVO> getTypeById(
            @Parameter(description = "字典类型ID") @PathVariable Long id) {
        return Result.success(dictService.getTypeById(id));
    }

    /**
     * 新建字典类型
     */
    @OperationLog(action = "新建字典类型")
    @Operation(summary = "新建字典类型", description = "新建字典类型")
    @PostMapping("/type")
    public Result<Long> createType(@Valid @RequestBody DictTypeDTO dto) {
        return Result.success("字典类型创建成功", dictService.createType(dto));
    }

    /**
     * 更新字典类型
     */
    @OperationLog(action = "更新字典类型")
    @Operation(summary = "更新字典类型", description = "根据ID更新字典类型")
    @PutMapping("/type/{id}")
    public Result<Boolean> updateType(
            @Parameter(description = "字典类型ID") @PathVariable Long id,
            @Valid @RequestBody DictTypeDTO dto) {
        return Result.success("字典类型更新成功", dictService.updateType(id, dto));
    }

    /**
     * 删除字典类型
     */
    @OperationLog(action = "删除字典类型")
    @Operation(summary = "删除字典类型", description = "根据ID删除字典类型，同时级联删除其下字典项")
    @DeleteMapping("/type/{id}")
    public Result<Boolean> deleteType(
            @Parameter(description = "字典类型ID") @PathVariable Long id) {
        return Result.success("字典类型删除成功", dictService.deleteType(id));
    }

    /**
     * 更新字典类型启用状态
     */
    @OperationLog(action = "更新字典类型启用状态")
    @Operation(summary = "更新字典类型启用状态", description = "根据ID切换字典类型启用状态")
    @PatchMapping("/type/{id}/enabled")
    public Result<Boolean> updateTypeEnabled(
            @Parameter(description = "字典类型ID") @PathVariable Long id,
            @Parameter(description = "是否启用: true-启用 false-停用") @RequestParam Boolean enabled) {
        return Result.success("状态更新成功", dictService.updateTypeEnabled(id, enabled));
    }

    // ─── 字典项 ───

    /**
     * 分页查询字典项列表
     */
    @OperationLog(action = "查询字典项列表")
    @Operation(summary = "分页查询字典项", description = "按类型编码查询，支持标签/值模糊查询与启用状态过滤")
    @GetMapping("/item/list")
    public Result<Page<DictItemVO>> getItemList(
            @Parameter(description = "当前页码,默认1") @RequestParam(defaultValue = "1") long page,
            @Parameter(description = "每页大小,默认10") @RequestParam(defaultValue = "10") long size,
            @Parameter(description = "所属字典类型编码") @RequestParam String typeCode,
            @Parameter(description = "标签/值模糊查询") @RequestParam(required = false) String keyword,
            @Parameter(description = "是否启用: true-启用 false-停用") @RequestParam(required = false) Boolean enabled) {
        return Result.success(dictService.getItemPage(page, size, typeCode, keyword, enabled));
    }

    /**
     * 查询字典项详情
     */
    @OperationLog(action = "查询字典项详情")
    @Operation(summary = "查询字典项详情", description = "根据ID查询字典项")
    @GetMapping("/item/{id}")
    public Result<DictItemVO> getItemById(
            @Parameter(description = "字典项ID") @PathVariable Long id) {
        return Result.success(dictService.getItemById(id));
    }

    /**
     * 新建字典项
     */
    @OperationLog(action = "新建字典项")
    @Operation(summary = "新建字典项", description = "新建字典项")
    @PostMapping("/item")
    public Result<Long> createItem(@Valid @RequestBody DictItemDTO dto) {
        return Result.success("字典项创建成功", dictService.createItem(dto));
    }

    /**
     * 更新字典项
     */
    @OperationLog(action = "更新字典项")
    @Operation(summary = "更新字典项", description = "根据ID更新字典项")
    @PutMapping("/item/{id}")
    public Result<Boolean> updateItem(
            @Parameter(description = "字典项ID") @PathVariable Long id,
            @Valid @RequestBody DictItemDTO dto) {
        return Result.success("字典项更新成功", dictService.updateItem(id, dto));
    }

    /**
     * 删除字典项
     */
    @OperationLog(action = "删除字典项")
    @Operation(summary = "删除字典项", description = "根据ID删除字典项")
    @DeleteMapping("/item/{id}")
    public Result<Boolean> deleteItem(
            @Parameter(description = "字典项ID") @PathVariable Long id) {
        return Result.success("字典项删除成功", dictService.deleteItem(id));
    }

    /**
     * 更新字典项启用状态
     */
    @OperationLog(action = "更新字典项启用状态")
    @Operation(summary = "更新字典项启用状态", description = "根据ID切换字典项启用状态")
    @PatchMapping("/item/{id}/enabled")
    public Result<Boolean> updateItemEnabled(
            @Parameter(description = "字典项ID") @PathVariable Long id,
            @Parameter(description = "是否启用: true-启用 false-停用") @RequestParam Boolean enabled) {
        return Result.success("状态更新成功", dictService.updateItemEnabled(id, enabled));
    }
}
