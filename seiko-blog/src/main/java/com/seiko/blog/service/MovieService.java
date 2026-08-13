package com.seiko.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.blog.dto.MovieDTO;
import com.seiko.blog.vo.MovieVO;

import java.util.List;

public interface MovieService {

    /**
     * 获取电影列表
     *
     * @return 电影列表
     */
    List<MovieVO> getMovieList();

    /**
     * 分页获取电影列表
     *
     * @param page      当前页
     * @param size      每页大小
     * @param movieName 电影名称模糊查询关键词，null 或空表示不限
     * @return 电影分页列表
     */
    Page<MovieVO> getMoviePage(long page, long size, String movieName);

    /**
     * 获取电影详情
     *
     * @param id 电影ID
     * @return 电影详情
     */
    MovieVO getMovieById(Long id);

    /**
     * 创建电影
     *
     * @param dto 电影创建请求
     * @return 新电影ID
     */
    Long createMovie(MovieDTO dto);

    /**
     * 更新电影
     *
     * @param id  电影ID
     * @param dto 电影更新请求
     * @return 是否更新成功
     */
    Boolean updateMovie(Long id, MovieDTO dto);

    /**
     * 删除电影
     *
     * @param id 电影ID
     * @return 是否删除成功
     */
    Boolean deleteMovie(Long id);

    /**
     * 更新电影置顶状态
     *
     * @param id    电影ID
     * @param isTop 是否置顶：0否 1是
     * @return 是否更新成功
     */
    Boolean updateTopStatus(Long id, Integer isTop);
}
