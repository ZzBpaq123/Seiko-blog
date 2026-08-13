package com.seiko.blog.controller.blog;

import com.seiko.common.result.Result;
import com.seiko.blog.service.BookService;
import com.seiko.blog.vo.BookVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 书籍控制器
 */
@Tag(name = "书籍模块", description = "书籍管理相关接口")
@RestController
@RequestMapping("/api/blog/book")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    /**
     * 获取书籍列表
     */
    @GetMapping
    @Operation(summary = "获取书籍列表", description = "获取所有书籍列表")
    public Result<List<BookVO>> getBookList() {
        return Result.success(bookService.getBookList());
    }
}
