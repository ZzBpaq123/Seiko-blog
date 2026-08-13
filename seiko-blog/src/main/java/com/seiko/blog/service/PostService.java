package com.seiko.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.blog.dto.PostDTO;
import com.seiko.blog.vo.PostVO;
import com.seiko.blog.vo.TagCountVO;
import com.seiko.blog.vo.TagVO;

import java.util.List;

/**
 * 文章服务接口
 */
public interface PostService {

    /**
     * 创建文章
     *
     * @param dto 文章创建请求
     * @return 新文章ID
     */
    Long createPost(PostDTO dto);

    /**
     * 更新文章
     *
     * @param id  文章ID
     * @param dto 文章更新请求
     * @return 是否更新成功
     */
    Boolean updatePost(Long id, PostDTO dto);

    /**
     * 删除文章
     *
     * @param id 文章ID
     * @return 是否删除成功
     */
    Boolean deletePost(Long id);

    /**
     * 分页获取文章列表
     *
     * @param page      当前页
     * @param size      每页大小
     * @param published 发布状态，null 表示不限
     * @param title     标题模糊查询关键词，null 或空表示不限
     * @param tag       标签名称，null 或空表示不限
     * @return 文章分页列表
     */
    Page<PostVO> getPostList(long page, long size, Boolean published, String title, String tag);

    /**
     * 根据ID获取文章详情
     *
     * @param id 文章ID
     * @return 文章详情
     */
    PostVO getPostById(Long id);

    /**
     * 根据slug获取文章详情
     *
     * @param slug URL标识
     * @return 文章详情
     */
    PostVO getPostBySlug(String slug);

    /**
     * 根据标签获取文章列表
     *
     * @param tag  标签名
     * @param page 当前页
     * @param size 每页大小
     * @return 文章分页列表
     */
    Page<PostVO> getPostsByTag(String tag, long page, long size);

    /**
     * 获取所有标签
     *
     * @return 标签列表
     */
    List<String> getAllTags();

    /**
     * 获取标签列表（含ID）
     *
     * @return 标签VO列表
     */
    List<TagVO> getTagList();

    /**
     * 获取标签统计
     *
     * @return 标签及文章数量
     */
    List<TagCountVO> getTagCounts();

    /**
     * 记录一次阅读并返回当前总阅读数。
     * <p>
     * 文章详情已被缓存，无法依赖每次访问写库累加阅读数。改为对 Redis 计数器
     * {@code post:read:{id}} 执行 INCR 得到自上次回刷以来的增量，由
     * {@code PostReadCountFlushTask} 定时回刷到 DB。
     *
     * @param postId      文章 ID
     * @param baseReadNum 缓存中的基准阅读数（上次回刷后的 DB 值）
     * @return 基准值 + Redis 增量后的总阅读数
     */
    long incrementReadCountAndGet(Long postId, int baseReadNum);
}
