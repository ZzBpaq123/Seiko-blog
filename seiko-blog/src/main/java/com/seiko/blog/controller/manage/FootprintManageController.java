package com.seiko.blog.controller.manage;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.result.Result;
import com.seiko.blog.dto.FootprintDTO;
import com.seiko.blog.service.FootprintService;
import com.seiko.blog.vo.FootprintVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 足迹管理控制器
 */
@Tag(name = "足迹管理", description = "后台足迹管理相关接口")
@RestController
@RequestMapping("/api/manage/footprint")
@RequiredArgsConstructor
public class FootprintManageController {

    private final FootprintService footprintService;

    /**
     * 查询足迹列表
     */
    @Operation(summary = "查询足迹列表", description = "分页查询足迹列表，支持类型和城市模糊查询")
    @GetMapping("/list")
    public Result<Page<FootprintVO>> getFootprintList(
            @Parameter(description = "当前页码，默认1") @RequestParam(defaultValue = "1") long page,
            @Parameter(description = "每页大小，默认10") @RequestParam(defaultValue = "10") long size,
            @Parameter(description = "足迹类型: domestic-国内, international-国际") @RequestParam(required = false) String footprintType,
            @Parameter(description = "城市名称模糊查询") @RequestParam(required = false) String city) {
        return Result.success(footprintService.getFootprintPage(page, size, footprintType, city));
    }

    /**
     * 创建足迹
     */
    @Operation(summary = "创建足迹", description = "新建足迹")
    @PostMapping
    public Result<Long> createFootprint(@Valid @RequestBody FootprintDTO dto) {
        return Result.success("足迹创建成功", footprintService.createFootprint(dto));
    }

    /**
     * 更新足迹
     */
    @Operation(summary = "更新足迹", description = "根据ID更新足迹")
    @PutMapping("/{id}")
    public Result<Boolean> updateFootprint(
            @Parameter(description = "足迹ID") @PathVariable Long id,
            @Valid @RequestBody FootprintDTO dto) {
        return Result.success("足迹更新成功", footprintService.updateFootprint(id, dto));
    }

    /**
     * 查询足迹详情
     */
    @Operation(summary = "查询足迹详情", description = "根据ID查询足迹详情")
    @GetMapping("/{id}")
    public Result<FootprintVO> getFootprintById(
            @Parameter(description = "足迹ID") @PathVariable Long id) {
        return Result.success(footprintService.getFootprintById(id));
    }

    /**
     * 删除足迹
     */
    @Operation(summary = "删除足迹", description = "根据ID删除足迹")
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteFootprint(
            @Parameter(description = "足迹ID") @PathVariable Long id) {
        return Result.success("足迹删除成功", footprintService.deleteFootprint(id));
    }
}
