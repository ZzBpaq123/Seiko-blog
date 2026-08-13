package com.seiko.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.seiko.common.exception.BusinessException;
import com.seiko.common.result.ResultCode;
import com.seiko.blog.config.RedisCacheConfig;
import com.seiko.blog.dto.PostDTO;
import com.seiko.blog.entity.Post;
import com.seiko.blog.entity.PostTag;
import com.seiko.blog.entity.Tag;
import com.seiko.blog.mapper.PostMapper;
import com.seiko.blog.mapper.PostTagMapper;
import com.seiko.blog.mapper.TagMapper;
import com.seiko.blog.service.PostService;
import com.seiko.blog.vo.PostVO;
import com.seiko.blog.vo.TagCountVO;
import com.seiko.blog.vo.TagVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 文章服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PostServiceImpl extends ServiceImpl<PostMapper, Post> implements PostService {

    /** 阅读数增量计数器 key 前缀 */
    public static final String READ_COUNT_PREFIX = "post:read:";

    private final TagMapper tagMapper;

    private final PostTagMapper postTagMapper;

    private final StringRedisTemplate redisTemplate;

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_POST, allEntries = true)
    public Long createPost(PostDTO dto) {
        // 构建文章实体
        Post post = new Post();
        post.setTitle(dto.getTitle().trim());
        post.setExcerpt(dto.getExcerpt());
        post.setContent(dto.getContent());
        post.setCover(dto.getCover());
        post.setAuthor(dto.getAuthor());
        post.setReadNum(0);
        post.setSlug(dto.getSlug());

        // 发布状态，默认草稿；发布时记录发布时间
        boolean published = Boolean.TRUE.equals(dto.getPublished());
        post.setPublished(published);
        if (published) {
            post.setPublishTime(new Date());
        }

        // 保存文章，回填自增ID
        this.save(post);

        // 处理标签：查找已有或新建，再建立文章-标签关联
        if (dto.getTags() != null && !dto.getTags().isEmpty()) {
            bindTags(post.getId(), dto.getTags());
        }

        return post.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_POST, allEntries = true)
    public Boolean deletePost(Long id) {
        Post post = this.getById(id);
        if (post == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        // 移除文章-标签关联
        postTagMapper.delete(new LambdaQueryWrapper<PostTag>().eq(PostTag::getPostId, id));

        // 逻辑删除文章
        return this.removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisCacheConfig.CACHE_POST, allEntries = true)
    public Boolean updatePost(Long id, PostDTO dto) {
        Post post = this.getById(id);
        if (post == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        post.setTitle(dto.getTitle().trim());
        post.setExcerpt(dto.getExcerpt());
        post.setContent(dto.getContent());
        post.setCover(dto.getCover());
        post.setAuthor(dto.getAuthor());
        if (dto.getSlug() != null && !dto.getSlug().isBlank()) {
            post.setSlug(dto.getSlug().trim());
        }

        // 发布状态变更时处理发布时间
        boolean published = Boolean.TRUE.equals(dto.getPublished());
        if (published && !Boolean.TRUE.equals(post.getPublished())) {
            post.setPublishTime(new Date());
        }
        post.setPublished(published);

        boolean success = this.updateById(post);

        // 重新绑定标签
        postTagMapper.delete(new LambdaQueryWrapper<PostTag>().eq(PostTag::getPostId, id));
        if (dto.getTags() != null && !dto.getTags().isEmpty()) {
            bindTags(id, dto.getTags());
        }

        return success;
    }

    /**
     * 为文章绑定标签，标签不存在时自动创建
     */
    private void bindTags(Long postId, List<String> tagNames) {
        tagNames.stream()
                .filter(name -> name != null && !name.isBlank())
                .map(String::trim)
                .distinct()
                .forEach(name -> {
                    Long tagId = getOrCreateTag(name);
                    PostTag postTag = new PostTag();
                    postTag.setPostId(postId);
                    postTag.setTagId(tagId);
                    postTagMapper.insert(postTag);
                });
    }

    /**
     * 根据标签名查找标签ID，不存在则创建
     */
    private Long getOrCreateTag(String name) {
        Tag tag = tagMapper.selectOne(
                new LambdaQueryWrapper<Tag>().eq(Tag::getName, name).last("LIMIT 1"));
        if (tag != null) {
            return tag.getId();
        }
        Tag newTag = new Tag();
        newTag.setName(name);
        newTag.setSlug(generateSlug(name, "tag"));
        tagMapper.insert(newTag);
        return newTag.getId();
    }

    /**
     * 将文本转为 URL 友好的 slug，无可用字符时回退为「前缀-时间戳」
     */
    private String generateSlug(String text, String fallbackPrefix) {
        String slug = text.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        if (slug.isBlank()) {
            slug = fallbackPrefix + "-" + System.currentTimeMillis();
        }
        return slug;
    }

    @Override
    @Cacheable(cacheNames = RedisCacheConfig.CACHE_POST,
            key = "'list:' + #page + ':' + #size",
            condition = "#published == true and (#title == null or #title.isBlank()) and (#tag == null or #tag.isBlank())")
    public Page<PostVO> getPostList(long page, long size, Boolean published, String title, String tag) {
        // 分页查询文章，按发布时间倒序
        Page<Post> postPage = new Page<>(page, size);
        LambdaQueryWrapper<Post> wrapper = new LambdaQueryWrapper<>();
        if (published != null) {
            wrapper.eq(Post::getPublished, published);
        }
        if (title != null && !title.isBlank()) {
            wrapper.like(Post::getTitle, title.trim());
        }

        // 根据标签过滤文章
        List<Long> postIds = findPostIdsByTag(tag);
        if (postIds != null) {
            if (postIds.isEmpty()) {
                // 标签不存在或无关联文章，返回空分页
                Page<PostVO> emptyPage = new Page<>();
                BeanUtils.copyProperties(postPage, emptyPage);
                emptyPage.setRecords(List.of());
                return emptyPage;
            }
            wrapper.in(Post::getId, postIds);
        }

        wrapper.orderByDesc(Post::getPublishTime);

        Page<Post> result = this.page(postPage, wrapper);

        // 转换为VO
        List<PostVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        Page<PostVO> voPage = new Page<>();
        BeanUtils.copyProperties(result, voPage);
        voPage.setRecords(voList);

        return voPage;
    }

    /**
     * 根据标签名称查询关联的文章ID列表；tag 为空时返回 null 表示不过滤
     */
    private List<Long> findPostIdsByTag(String tag) {
        if (tag == null || tag.isBlank()) {
            return null;
        }
        String tagName = tag.trim();
        Tag targetTag = tagMapper.selectOne(
                new LambdaQueryWrapper<Tag>().eq(Tag::getName, tagName).last("LIMIT 1"));
        if (targetTag == null) {
            return List.of();
        }
        return postTagMapper.selectList(
                        new LambdaQueryWrapper<PostTag>().eq(PostTag::getTagId, targetTag.getId()))
                .stream()
                .map(PostTag::getPostId)
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    public PostVO getPostById(Long id) {
        Post post = this.getById(id);
        if (post == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return convertToVO(post);
    }

    @Override
    @Cacheable(cacheNames = RedisCacheConfig.CACHE_POST, key = "'slug:' + #slug", unless = "#result == null")
    public PostVO getPostBySlug(String slug) {
        LambdaQueryWrapper<Post> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Post::getSlug, slug);
        wrapper.eq(Post::getPublished, true);

        Post post = this.getOne(wrapper);
        if (post == null) {
            return null;
        }

        // 阅读数累加已迁移至 Redis 计数 + 定时回刷，此处仅返回基准值
        return convertToVO(post);
    }

    @Override
    public long incrementReadCountAndGet(Long postId, int baseReadNum) {
        Long delta = redisTemplate.opsForValue().increment(READ_COUNT_PREFIX + postId);
        return baseReadNum + (delta == null ? 0L : delta);
    }

    @Override
    public Page<PostVO> getPostsByTag(String tag, long page, long size) {
        // 先获取该标签下的所有文章ID
        Page<PostVO> voPage = new Page<>(page, size);
        // TODO: 通过标签筛选文章（需要联表查询）
        return voPage;
    }

    @Override
    @Cacheable(cacheNames = RedisCacheConfig.CACHE_POST, key = "'tags'")
    public List<String> getAllTags() {
        return tagMapper.selectList(null)
                .stream()
                .map(tag -> tag.getName())
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    public List<TagVO> getTagList() {
        return tagMapper.selectList(null)
                .stream()
                .map(tag -> {
                    TagVO vo = new TagVO();
                    BeanUtils.copyProperties(tag, vo);
                    return vo;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(cacheNames = RedisCacheConfig.CACHE_POST, key = "'tagCounts'")
    public List<TagCountVO> getTagCounts() {
        // 查询已发布文章总数
        LambdaQueryWrapper<Post> totalWrapper = new LambdaQueryWrapper<>();
        totalWrapper.eq(Post::getPublished, true);
        long totalPosts = this.count(totalWrapper);

        List<Map<String, Object>> list = tagMapper.selectTagCounts();
        return list.stream()
                .map(map -> new TagCountVO(
                        (String) map.get("tag"),
                        ((Number) map.get("count")).intValue(),
                        (int) totalPosts
                ))
                .collect(Collectors.toList());
    }

    /**
     * 将 Post 实体转换为 PostVO
     */
    private PostVO convertToVO(Post post) {
        PostVO vo = new PostVO();
        BeanUtils.copyProperties(post, vo);

        // 设置日期为发布时间
        vo.setDate(post.getPublishTime());

        // 查询标签列表
        List<String> tags = tagMapper.selectTagNamesByPostId(post.getId());
        vo.setTags(tags);

        return vo;
    }
}
