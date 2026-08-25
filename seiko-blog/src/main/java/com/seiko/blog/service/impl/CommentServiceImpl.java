package com.seiko.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.constant.RedisConstant;
import com.seiko.common.exception.BusinessException;
import com.seiko.common.result.ResultCode;
import com.seiko.blog.config.RedisCacheConfig;
import com.seiko.blog.dto.CommentDTO;
import com.seiko.blog.entity.Comment;
import com.seiko.blog.mapper.CommentMapper;
import com.seiko.blog.service.CommentService;
import com.seiko.blog.service.VerificationCodeService;
import com.seiko.blog.vo.CommentVO;
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
 * 评论服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentMapper commentMapper;
    private final VerificationCodeService verificationCodeService;

    @Override
    @Cacheable(cacheNames = RedisConstant.CACHE_COMMENT, key = "'all'")
    public List<CommentVO> getCommentList() {
        return commentMapper.selectList(
                new LambdaQueryWrapper<Comment>()
                    .orderByDesc(Comment::getId)
        ).stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    public Page<CommentVO> getCommentPage(long page, long size, String author) {
        Page<Comment> commentPage = new Page<>(page, size);
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<Comment>();
        if (author != null && !author.isBlank()) {
            wrapper.like(Comment::getAuthor, author.trim());
        }
        wrapper.orderByDesc(Comment::getId);

        Page<Comment> result = commentMapper.selectPage(commentPage, wrapper);

        List<CommentVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        Page<CommentVO> voPage = new Page<>();
        BeanUtils.copyProperties(result, voPage);
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    @Cacheable(cacheNames = RedisConstant.CACHE_COMMENT, key = "'id:' + #id", unless = "#result == null")
    public CommentVO getCommentById(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null || comment.getIsDeleted() == 1) {
            throw new BusinessException(500, "评论不存在");
        }
        return convertToVO(comment);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisConstant.CACHE_COMMENT, allEntries = true)
    public CommentVO createComment(CommentDTO commentDTO) {
        boolean verified = verificationCodeService.verify(
                commentDTO.getUserEmail(), commentDTO.getCode());
        if (!verified) {
            throw new BusinessException(ResultCode.VERIFICATION_CODE_ERROR);
        }

        Comment comment = convertToEntity(commentDTO);
        commentMapper.insert(comment);
        log.info("创建评论: {}", comment.getCommentContent());

        return convertToVO(comment);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisConstant.CACHE_COMMENT, allEntries = true)
    public void deleteComment(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null || comment.getIsDeleted() == 1) {
            throw new BusinessException(500, "评论不存在");
        }

        commentMapper.deleteById(id);
        log.info("删除评论: {}", comment.getCommentContent());
    }

    @Override
    @Cacheable(cacheNames = RedisConstant.CACHE_COMMENT, key = "'post:' + #postId")
    public List<CommentVO> getCommentListByPostId(Long postId) {
        return commentMapper.selectList(
                new LambdaQueryWrapper<Comment>()
                    .eq(Comment::getPostId, postId)
                    .orderByDesc(Comment::getId)
        ).stream().map(this::convertToVO).collect(Collectors.toList());
    }

    private CommentVO convertToVO(Comment comment) {
        if (comment == null) {
            return null;
        }
        CommentVO vo = new CommentVO();
        vo.setId(comment.getId());
        vo.setUserEmail(comment.getUserEmail());
        vo.setAuthor(comment.getAuthor());
        vo.setCommentContent(comment.getCommentContent());
        vo.setCommentDate(comment.getCommentDate());
        vo.setAvatarColor(comment.getAvatarColor());
        vo.setPostId(comment.getPostId());
        vo.setCreateTime(comment.getCreateTime());
        return vo;
    }

    private Comment convertToEntity(CommentDTO dto) {
        Comment comment = new Comment();
        comment.setUserEmail(dto.getUserEmail());
        comment.setAuthor(dto.getAuthor());
        comment.setCommentContent(dto.getCommentContent());
        comment.setCommentDate(dto.getCommentDate());
        comment.setAvatarColor(dto.getAvatarColor());
        comment.setPostId(dto.getPostId());
        return comment;
    }
}
