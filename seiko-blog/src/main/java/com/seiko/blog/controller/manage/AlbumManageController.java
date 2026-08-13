package com.seiko.blog.controller.manage;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.result.Result;
import com.seiko.blog.dto.AlbumDTO;
import com.seiko.blog.service.AlbumService;
import com.seiko.blog.vo.AlbumVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 相册管理控制器
 */
@Tag(name = "相册管理", description = "后台相册管理相关接口")
@RestController
@RequestMapping("/api/manage/album")
@RequiredArgsConstructor
public class AlbumManageController {

    private final AlbumService albumService;

    /**
     * 查询相册列表
     */
    @Operation(summary = "查询相册列表", description = "分页查询相册列表，支持相册名称模糊查询")
    @GetMapping("/list")
    public Result<Page<AlbumVO>> getAlbumList(
            @Parameter(description = "当前页码，默认1") @RequestParam(defaultValue = "1") long page,
            @Parameter(description = "每页大小，默认10") @RequestParam(defaultValue = "10") long size,
            @Parameter(description = "相册名称模糊查询") @RequestParam(required = false) String albumName) {
        return Result.success(albumService.getAlbumPage(page, size, albumName));
    }

    /**
     * 创建相册
     */
    @Operation(summary = "创建相册", description = "新建相册")
    @PostMapping
    public Result<Long> createAlbum(@Valid @RequestBody AlbumDTO dto) {
        return Result.success("相册创建成功", albumService.createAlbum(dto));
    }

    /**
     * 更新相册
     */
    @Operation(summary = "更新相册", description = "根据ID更新相册")
    @PutMapping("/{id}")
    public Result<Boolean> updateAlbum(
            @Parameter(description = "相册ID") @PathVariable Long id,
            @Valid @RequestBody AlbumDTO dto) {
        return Result.success("相册更新成功", albumService.updateAlbum(id, dto));
    }

    /**
     * 查询相册详情
     */
    @Operation(summary = "查询相册详情", description = "根据ID查询相册详情")
    @GetMapping("/{id}")
    public Result<AlbumVO> getAlbumById(
            @Parameter(description = "相册ID") @PathVariable Long id) {
        return Result.success(albumService.getAlbumById(id));
    }

    /**
     * 删除相册
     */
    @Operation(summary = "删除相册", description = "根据ID删除相册，同时删除相册下的照片")
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteAlbum(
            @Parameter(description = "相册ID") @PathVariable Long id) {
        return Result.success("相册删除成功", albumService.deleteAlbum(id));
    }
}
