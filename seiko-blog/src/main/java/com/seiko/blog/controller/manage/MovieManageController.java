package com.seiko.blog.controller.manage;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.annotation.OperationLog;
import com.seiko.common.result.Result;
import com.seiko.blog.dto.MovieDTO;
import com.seiko.blog.service.MovieService;
import com.seiko.blog.vo.MovieVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 电影管理控制器
 */
@Tag(name = "电影管理", description = "后台电影管理相关接口")
@RestController
@RequestMapping("/api/manage/movie")
@RequiredArgsConstructor
public class MovieManageController {

    private final MovieService movieService;

    /**
     * 查询电影列表
     */
    @OperationLog(action = "查询电影列表")
    @Operation(summary = "查询电影列表", description = "分页查询电影列表，支持电影名称模糊查询，置顶电影优先")
    @GetMapping("/list")
    public Result<Page<MovieVO>> getMovieList(
            @Parameter(description = "当前页码，默认1") @RequestParam(defaultValue = "1") long page,
            @Parameter(description = "每页大小，默认10") @RequestParam(defaultValue = "10") long size,
            @Parameter(description = "电影名称模糊查询") @RequestParam(required = false) String movieName) {
        return Result.success(movieService.getMoviePage(page, size, movieName));
    }

    /**
     * 创建电影
     */
    @OperationLog(action = "创建电影")
    @Operation(summary = "创建电影", description = "新建电影")
    @PostMapping
    public Result<Long> createMovie(@Valid @RequestBody MovieDTO dto) {
        return Result.success("电影创建成功", movieService.createMovie(dto));
    }

    /**
     * 更新电影
     */
    @OperationLog(action = "更新电影")
    @Operation(summary = "更新电影", description = "根据ID更新电影")
    @PutMapping("/{id}")
    public Result<Boolean> updateMovie(
            @Parameter(description = "电影ID") @PathVariable Long id,
            @Valid @RequestBody MovieDTO dto) {
        return Result.success("电影更新成功", movieService.updateMovie(id, dto));
    }

    /**
     * 查询电影详情
     */
    @OperationLog(action = "查询电影详情")
    @Operation(summary = "查询电影详情", description = "根据ID查询电影详情")
    @GetMapping("/{id}")
    public Result<MovieVO> getMovieById(
            @Parameter(description = "电影ID") @PathVariable Long id) {
        return Result.success(movieService.getMovieById(id));
    }

    /**
     * 删除电影
     */
    @OperationLog(action = "删除电影")
    @Operation(summary = "删除电影", description = "根据ID删除电影")
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteMovie(
            @Parameter(description = "电影ID") @PathVariable Long id) {
        return Result.success("电影删除成功", movieService.deleteMovie(id));
    }

    /**
     * 更新电影置顶状态
     */
    @OperationLog(action = "更新电影置顶状态")
    @Operation(summary = "更新电影置顶状态", description = "根据ID切换电影置顶状态")
    @PatchMapping("/{id}/top")
    public Result<Boolean> updateMovieTop(
            @Parameter(description = "电影ID") @PathVariable Long id,
            @Parameter(description = "是否置顶: 0-否, 1-是") @RequestParam Integer isTop) {
        return Result.success("状态更新成功", movieService.updateTopStatus(id, isTop));
    }
}
