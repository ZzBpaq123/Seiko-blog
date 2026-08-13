package com.seiko.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.blog.dto.BookDTO;
import com.seiko.blog.vo.BookVO;

import java.util.List;

public interface BookService {

    /**
     * 获取书籍列表
     *
     * @return 书籍列表
     */
    List<BookVO> getBookList();

    /**
     * 分页获取书籍列表
     *
     * @param page     当前页
     * @param size     每页大小
     * @param bookName 书籍名称模糊查询关键词，null 或空表示不限
     * @return 书籍分页列表
     */
    Page<BookVO> getBookPage(long page, long size, String bookName);

    /**
     * 获取书籍详情
     *
     * @param id 书籍ID
     * @return 书籍详情
     */
    BookVO getBookById(Long id);

    /**
     * 创建书籍
     *
     * @param dto 书籍创建请求
     * @return 新书籍ID
     */
    Long createBook(BookDTO dto);

    /**
     * 更新书籍
     *
     * @param id  书籍ID
     * @param dto 书籍更新请求
     * @return 是否更新成功
     */
    Boolean updateBook(Long id, BookDTO dto);

    /**
     * 删除书籍
     *
     * @param id 书籍ID
     * @return 是否删除成功
     */
    Boolean deleteBook(Long id);
}
