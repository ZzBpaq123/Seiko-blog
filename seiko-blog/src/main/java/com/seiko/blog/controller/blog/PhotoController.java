package com.seiko.blog.controller.blog;

import com.seiko.common.result.Result;
import com.seiko.blog.service.AlbumService;
import com.seiko.blog.service.PhotoService;
import com.seiko.blog.vo.AlbumVO;
import com.seiko.blog.vo.PhotoVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 相册控制器
 */
@Tag(name = "相册模块", description = "相册管理相关接口")
@RestController
@RequestMapping("/api/blog/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;
    private final AlbumService albumService;

    /**
     * 获取照片列表
     */
    @GetMapping
    @Operation(summary = "获取照片列表", description = "获取所有照片列表，按排序序号和创建时间排列")
    public Result<List<PhotoVO>> getPhotoList() {
        return Result.success(photoService.getPhotoList());
    }

    /**
     * 获取相册列表（相册维度）
     */
    @GetMapping("/albums")
    @Operation(summary = "获取相册列表", description = "获取所有相册列表，按创建时间倒序排列")
    public Result<List<AlbumVO>> getAlbumList() {
        return Result.success(albumService.getAlbumList());
    }

    /**
     * 根据相册ID获取照片列表
     */
    @GetMapping("/album/{albumId}")
    @Operation(summary = "根据相册ID获取照片", description = "根据相册ID查询该相册下的所有照片")
    public Result<List<PhotoVO>> getPhotosByAlbumId(
            @Parameter(description = "相册ID") @PathVariable Long albumId) {
        return Result.success(photoService.getPhotosByAlbumId(albumId));
    }

    /**
     * 获取相册详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取相册详情", description = "根据ID获取相册详情")
    public Result<PhotoVO> getPhotoById(
            @Parameter(description = "相册ID") @PathVariable Long id) {
        return Result.success(photoService.getPhotoById(id));
    }

    /**
     * 根据拍摄地点获取相册列表
     */
    @GetMapping("/location/{location}")
    @Operation(summary = "根据地点获取相册", description = "根据拍摄地点筛选相册")
    public Result<List<PhotoVO>> getPhotoListByLocation(
            @Parameter(description = "拍摄地点") @PathVariable String location) {
        return Result.success(photoService.getPhotoListByLocation(location));
    }
}
