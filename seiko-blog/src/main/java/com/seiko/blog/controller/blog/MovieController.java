package com.seiko.blog.controller.blog;

import com.seiko.common.result.Result;
import com.seiko.blog.service.MovieService;
import com.seiko.blog.vo.MovieVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 电影控制器
 */
@Tag(name = "电影模块", description = "电影管理相关接口")
@RestController
@RequestMapping("/api/blog/movie")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    /**
     * 获取电影列表
     */
    @GetMapping
    @Operation(summary = "获取电影列表", description = "获取所有电影列表，置顶优先")
    public Result<List<MovieVO>> getMovieList() {
        return Result.success(movieService.getMovieList());
    }
}
