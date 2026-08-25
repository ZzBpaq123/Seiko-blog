package com.seiko.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.constant.RedisConstant;
import com.seiko.common.exception.BusinessException;
import com.seiko.common.result.ResultCode;
import com.seiko.blog.dto.BookDTO;
import com.seiko.blog.entity.Book;
import com.seiko.blog.mapper.BookMapper;
import com.seiko.blog.config.RedisCacheConfig;
import com.seiko.blog.service.BookService;
import com.seiko.blog.vo.BookVO;
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
 * 书籍服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {

    private final BookMapper bookMapper;

    @Override
    @Cacheable(cacheNames = RedisConstant.CACHE_BOOK, key = "'all'")
    public List<BookVO> getBookList() {
        return bookMapper.selectList(
                new LambdaQueryWrapper<Book>()
                        .orderByDesc(Book::getId)
        ).stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    public Page<BookVO> getBookPage(long page, long size, String bookName) {
        Page<Book> bookPage = new Page<>(page, size);
        LambdaQueryWrapper<Book> wrapper = new LambdaQueryWrapper<>();
        if (bookName != null && !bookName.isBlank()) {
            wrapper.like(Book::getBookName, bookName.trim());
        }
        wrapper.orderByDesc(Book::getId);

        Page<Book> result = bookMapper.selectPage(bookPage, wrapper);

        List<BookVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        Page<BookVO> voPage = new Page<>();
        BeanUtils.copyProperties(result, voPage);
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    public BookVO getBookById(Long id) {
        Book book = bookMapper.selectById(id);
        if (book == null || book.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return convertToVO(book);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisConstant.CACHE_BOOK, allEntries = true)
    public Long createBook(BookDTO dto) {
        Book book = new Book();
        BeanUtils.copyProperties(dto, book);
        bookMapper.insert(book);
        return book.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisConstant.CACHE_BOOK, allEntries = true)
    public Boolean updateBook(Long id, BookDTO dto) {
        Book book = bookMapper.selectById(id);
        if (book == null || book.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        BeanUtils.copyProperties(dto, book);
        book.setId(id);
        return bookMapper.updateById(book) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = RedisConstant.CACHE_BOOK, allEntries = true)
    public Boolean deleteBook(Long id) {
        Book book = bookMapper.selectById(id);
        if (book == null || book.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        return bookMapper.deleteById(id) > 0;
    }

    private BookVO convertToVO(Book book) {
        if (book == null) {
            return null;
        }
        BookVO bookVO = new BookVO();
        bookVO.setId(book.getId());
        bookVO.setBookName(book.getBookName());
        bookVO.setBookAuthor(book.getBookAuthor());
        bookVO.setDescription(book.getDescription());
        bookVO.setBookCover(book.getBookCover());
        return bookVO;
    }
}
