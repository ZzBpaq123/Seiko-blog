package com.seiko.blog.controller.manage;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.annotation.OperationLog;
import com.seiko.common.result.Result;
import com.seiko.blog.dto.PhotoDTO;
import com.seiko.blog.service.PhotoService;
import com.seiko.blog.vo.PhotoVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 照片管理控制器
 */
@Tag(name = "照片管理", description = "后台照片管理相关接口")
@RestController
@RequestMapping("/api/manage/photo")
@RequiredArgsConstructor
public class PhotoManageController {

    private final PhotoService photoService;

    /**
     * 查询照片列表
     */
    @OperationLog(action = "查询照片列表")
    @Operation(summary = "查询照片列表", description = "分页查询照片列表，支持相册ID和拍摄地点模糊查询")
    @GetMapping("/list")
    public Result<Page<PhotoVO>> getPhotoList(
            @Parameter(description = "当前页码，默认1") @RequestParam(defaultValue = "1") long page,
            @Parameter(description = "每页大小，默认10") @RequestParam(defaultValue = "10") long size,
            @Parameter(description = "相册ID") @RequestParam(required = false) Long albumId,
            @Parameter(description = "拍摄地点模糊查询") @RequestParam(required = false) String location) {
        return Result.success(photoService.getPhotoPage(page, size, albumId, location));
    }

    /**
     * 创建照片
     */
    @OperationLog(action = "创建照片")
    @Operation(summary = "创建照片", description = "向相册中新增照片")
    @PostMapping
    public Result<Long> createPhoto(@Valid @RequestBody PhotoDTO dto) {
        return Result.success("照片创建成功", photoService.createPhoto(dto));
    }

    /**
     * 批量创建照片
     */
    @OperationLog(action = "批量创建照片")
    @Operation(summary = "批量创建照片", description = "向相册中批量新增照片")
    @PostMapping("/batch")
    public Result<Boolean> batchCreatePhotos(@RequestBody @Valid List<PhotoDTO> dtoList) {
        return Result.success("照片批量创建成功", photoService.batchCreatePhotos(dtoList));
    }

    /**
     * 更新照片
     */
    @OperationLog(action = "更新照片")
    @Operation(summary = "更新照片", description = "根据ID更新照片")
    @PutMapping("/{id}")
    public Result<Boolean> updatePhoto(
            @Parameter(description = "照片ID") @PathVariable Long id,
            @Valid @RequestBody PhotoDTO dto) {
        return Result.success("照片更新成功", photoService.updatePhoto(id, dto));
    }

    /**
     * 查询照片详情
     */
    @OperationLog(action = "查询照片详情")
    @Operation(summary = "查询照片详情", description = "根据ID查询照片详情")
    @GetMapping("/{id}")
    public Result<PhotoVO> getPhotoById(
            @Parameter(description = "照片ID") @PathVariable Long id) {
        return Result.success(photoService.getPhotoById(id));
    }

    /**
     * 删除照片
     */
    @OperationLog(action = "删除照片")
    @Operation(summary = "删除照片", description = "根据ID删除照片")
    @DeleteMapping("/{id}")
    public Result<Boolean> deletePhoto(
            @Parameter(description = "照片ID") @PathVariable Long id) {
        return Result.success("照片删除成功", photoService.deletePhoto(id));
    }
}
