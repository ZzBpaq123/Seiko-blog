package com.seiko.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.exception.BusinessException;
import com.seiko.common.result.ResultCode;
import com.seiko.blog.dto.MovieDTO;
import com.seiko.blog.entity.Movie;
import com.seiko.blog.mapper.MovieMapper;
import com.seiko.blog.config.RedisCacheConfig;
import com.seiko.blog.service.MovieService;
import com.seiko.blog.vo.MovieVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 电影服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieMapper movieMapper;

    @Override
    @Cacheable(cacheNames = RedisCacheConfig.CACHE_MOVIE, key = "'all'")
    public List<MovieVO> getMovieList() {
        return movieMapper.selectList(
                new LambdaQueryWrapper<Movie>()
                        .orderByDesc(Movie::getIsTop)
                        .orderByDesc(Movie::getId)
        ).stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    public Page<MovieVO> getMoviePage(long page, long size, String movieName) {
        Page<Movie> moviePage = new Page<>(page, size);
        LambdaQueryWrapper<Movie> wrapper = new LambdaQueryWrapper<>();
        if (movieName != null && !movieName.isBlank()) {
            wrapper.like(Movie::getMovieName, movieName.trim());
        }
        wrapper.orderByDesc(Movie::getIsTop).orderByDesc(Movie::getId);

        Page<Movie> result = movieMapper.selectPage(moviePage, wrapper);

        List<MovieVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        Page<MovieVO> voPage = new Page<>();
        BeanUtils.copyProperties(result, voPage);
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    public MovieVO getMovieById(Long id) {
        Movie movie = movieMapper.selectById(id);
        if (movie == null || movie.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return convertToVO(movie);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_MOVIE, allEntries = true)
    public Long createMovie(MovieDTO dto) {
        Movie movie = new Movie();
        BeanUtils.copyProperties(dto, movie);
        movieMapper.insert(movie);
        return movie.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_MOVIE, allEntries = true)
    public Boolean updateMovie(Long id, MovieDTO dto) {
        Movie movie = movieMapper.selectById(id);
        if (movie == null || movie.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        BeanUtils.copyProperties(dto, movie);
        movie.setId(id);
        return movieMapper.updateById(movie) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_MOVIE, allEntries = true)
    public Boolean deleteMovie(Long id) {
        Movie movie = movieMapper.selectById(id);
        if (movie == null || movie.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        return movieMapper.deleteById(id) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_MOVIE, allEntries = true)
    public Boolean updateTopStatus(Long id, Integer isTop) {
        Movie movie = movieMapper.selectById(id);
        if (movie == null || movie.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        movie.setIsTop(isTop);
        return movieMapper.updateById(movie) > 0;
    }

    private MovieVO convertToVO(Movie movie) {
        if (movie == null) {
            return null;
        }
        MovieVO movieVO = new MovieVO();
        movieVO.setId(movie.getId());
        movieVO.setMovieName(movie.getMovieName());
        movieVO.setIsTop(movie.getIsTop());
        movieVO.setRating(movie.getRating());
        movieVO.setRatingSource(movie.getRatingSource());
        movieVO.setTags(movie.getTags());
        movieVO.setSynopsis(movie.getSynopsis());
        movieVO.setBackdrop(movie.getBackdrop());
        movieVO.setDuration(movie.getDuration());
        return movieVO;
    }
}
