package com.seiko.blog.controller.blog;

import com.seiko.common.result.Result;
import com.seiko.blog.service.FootprintService;
import com.seiko.blog.vo.FootprintVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 足迹控制器
 */
@Tag(name = "足迹模块", description = "足迹管理相关接口")
@RestController
@RequestMapping("/api/blog/footprints")
@RequiredArgsConstructor
public class FootprintController {

    private final FootprintService footprintService;

    /**
     * 获取足迹列表
     */
    @GetMapping
    @Operation(summary = "获取足迹列表", description = "获取所有足迹列表，按日期倒序排列")
    public Result<List<FootprintVO>> getFootprintList() {
        return Result.success(footprintService.getFootprintList());
    }

    /**
     * 获取足迹详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取足迹详情", description = "根据ID获取足迹详情")
    public Result<FootprintVO> getFootprintById(
            @Parameter(description = "足迹ID") @PathVariable Long id) {
        return Result.success(footprintService.getFootprintById(id));
    }

    /**
     * 根据类型获取足迹列表
     */
    @GetMapping("/type/{type}")
    @Operation(summary = "根据类型获取足迹", description = "根据足迹类型获取列表 (domestic-国内, international-国际)")
    public Result<List<FootprintVO>> getFootprintListByType(
            @Parameter(description = "足迹类型") @PathVariable String type) {
        return Result.success(footprintService.getFootprintListByType(type));
    }
}
