package com.seiko.blog.controller.manage;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.result.Result;
import com.seiko.blog.dto.UserDTO;
import com.seiko.blog.service.UserService;
import com.seiko.blog.vo.UserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 用户管理控制器
 */
@Tag(name = "用户管理", description = "后台用户管理相关接口")
@RestController
@RequestMapping("/api/manage/user")
@RequiredArgsConstructor
public class UserManageController {

    private final UserService userService;

    /**
     * 查询用户列表
     */
    @Operation(summary = "查询用户列表", description = "分页查询用户列表，支持用户名/昵称、邮箱模糊查询、角色和状态过滤")
    @GetMapping("/list")
    public Result<Page<UserVO>> getUserList(
            @Parameter(description = "当前页码，默认1") @RequestParam(defaultValue = "1") long page,
            @Parameter(description = "每页大小，默认10") @RequestParam(defaultValue = "10") long size,
            @Parameter(description = "用户名/昵称模糊查询") @RequestParam(required = false) String username,
            @Parameter(description = "邮箱模糊查询") @RequestParam(required = false) String email,
            @Parameter(description = "用户角色: admin-管理员, user-普通用户") @RequestParam(required = false) String userRole,
            @Parameter(description = "用户状态: active-激活, inactive-禁用") @RequestParam(required = false) String userStatus) {
        return Result.success(userService.getUserPage(page, size, username, email, userRole, userStatus));
    }

    /**
     * 创建用户
     */
    @Operation(summary = "创建用户", description = "新建用户，密码必填")
    @PostMapping
    public Result<Long> createUser(@Valid @RequestBody UserDTO dto) {
        return Result.success("用户创建成功", userService.createUser(dto));
    }

    /**
     * 更新用户
     */
    @Operation(summary = "更新用户", description = "根据ID更新用户，密码留空表示不修改")
    @PutMapping("/{id}")
    public Result<Boolean> updateUser(
            @Parameter(description = "用户ID") @PathVariable Long id,
            @Valid @RequestBody UserDTO dto) {
        return Result.success("用户更新成功", userService.updateUser(id, dto));
    }

    /**
     * 查询用户详情
     */
    @Operation(summary = "查询用户详情", description = "根据ID查询用户详情")
    @GetMapping("/{id}")
    public Result<UserVO> getUserById(
            @Parameter(description = "用户ID") @PathVariable Long id) {
        return Result.success(userService.getUserById(id));
    }

    /**
     * 删除用户
     */
    @Operation(summary = "删除用户", description = "根据ID删除用户")
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteUser(
            @Parameter(description = "用户ID") @PathVariable Long id) {
        return Result.success("用户删除成功", userService.deleteUser(id));
    }

    /**
     * 更新用户状态
     */
    @Operation(summary = "更新用户状态", description = "根据ID切换用户状态(激活/禁用)")
    @PatchMapping("/{id}/status")
    public Result<Boolean> updateUserStatus(
            @Parameter(description = "用户ID") @PathVariable Long id,
            @Parameter(description = "用户状态: active-激活, inactive-禁用") @RequestParam String userStatus) {
        return Result.success("状态更新成功", userService.updateUserStatus(id, userStatus));
    }

    /**
     * 重置用户密码
     */
    @Operation(summary = "重置用户密码", description = "根据ID重置用户密码")
    @PatchMapping("/{id}/password")
    public Result<Boolean> resetUserPassword(
            @Parameter(description = "用户ID") @PathVariable Long id,
            @Parameter(description = "新密码，长度6-20") @RequestParam String newPassword) {
        return Result.success("密码重置成功", userService.resetUserPassword(id, newPassword));
    }
}
