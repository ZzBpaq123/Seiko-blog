package com.seiko.blog.controller.manage;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.result.Result;
import com.seiko.blog.dto.BookDTO;
import com.seiko.blog.service.BookService;
import com.seiko.blog.vo.BookVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 书籍管理控制器
 */
@Tag(name = "书籍管理", description = "后台书籍管理相关接口")
@RestController
@RequestMapping("/api/manage/book")
@RequiredArgsConstructor
public class BookManageController {

    private final BookService bookService;

    /**
     * 查询书籍列表
     */
    @Operation(summary = "查询书籍列表", description = "分页查询书籍列表，支持书籍名称模糊查询")
    @GetMapping("/list")
    public Result<Page<BookVO>> getBookList(
            @Parameter(description = "当前页码，默认1") @RequestParam(defaultValue = "1") long page,
            @Parameter(description = "每页大小，默认10") @RequestParam(defaultValue = "10") long size,
            @Parameter(description = "书籍名称模糊查询") @RequestParam(required = false) String bookName) {
        return Result.success(bookService.getBookPage(page, size, bookName));
    }

    /**
     * 创建书籍
     */
    @Operation(summary = "创建书籍", description = "新建书籍")
    @PostMapping
    public Result<Long> createBook(@Valid @RequestBody BookDTO dto) {
        return Result.success("书籍创建成功", bookService.createBook(dto));
    }

    /**
     * 更新书籍
     */
    @Operation(summary = "更新书籍", description = "根据ID更新书籍")
    @PutMapping("/{id}")
    public Result<Boolean> updateBook(
            @Parameter(description = "书籍ID") @PathVariable Long id,
            @Valid @RequestBody BookDTO dto) {
        return Result.success("书籍更新成功", bookService.updateBook(id, dto));
    }

    /**
     * 查询书籍详情
     */
    @Operation(summary = "查询书籍详情", description = "根据ID查询书籍详情")
    @GetMapping("/{id}")
    public Result<BookVO> getBookById(
            @Parameter(description = "书籍ID") @PathVariable Long id) {
        return Result.success(bookService.getBookById(id));
    }

    /**
     * 删除书籍
     */
    @Operation(summary = "删除书籍", description = "根据ID删除书籍")
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteBook(
            @Parameter(description = "书籍ID") @PathVariable Long id) {
        return Result.success("书籍删除成功", bookService.deleteBook(id));
    }
}
