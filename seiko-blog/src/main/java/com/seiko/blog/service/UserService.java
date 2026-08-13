package com.seiko.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.blog.dto.LoginDTO;
import com.seiko.blog.dto.RegisterDTO;
import com.seiko.blog.dto.UserDTO;
import com.seiko.blog.entity.User;
import com.seiko.blog.vo.LoginVO;
import com.seiko.blog.vo.UserVO;

/**
 * 用户服务接口
 */
public interface UserService {

    /**
     * 用户登录
     *
     * @param loginDTO 登录信息
     * @return 登录结果
     */
    LoginVO login(LoginDTO loginDTO);

    /**
     * 用户注册
     *
     * @param registerDTO 注册信息
     * @return 注册结果
     */
    LoginVO register(RegisterDTO registerDTO);

    /**
     * 用户登出
     */
    void logout();

    /**
     * 获取当前登录用户信息
     *
     * @return 用户信息
     */
    UserVO getCurrentUser();

    /**
     * 根据用户名获取用户
     *
     * @param username 用户名
     * @return 用户实体
     */
    User getUserByUsername(String username);

    /**
     * 转换用户实体为VO
     *
     * @param user 用户实体
     * @return 用户VO
     */
    UserVO convertToUserVO(User user);

    /**
     * 分页查询用户列表
     *
     * @param page       当前页
     * @param size       每页大小
     * @param username   用户名/昵称模糊查询关键词，null 或空表示不限
     * @param email      邮箱模糊查询关键词，null 或空表示不限
     * @param userRole   用户角色过滤，null 或空表示不限
     * @param userStatus 用户状态过滤，null 或空表示不限
     * @return 用户分页列表
     */
    Page<UserVO> getUserPage(long page, long size, String username, String email, String userRole, String userStatus);

    /**
     * 获取用户详情
     *
     * @param id 用户ID
     * @return 用户详情
     */
    UserVO getUserById(Long id);

    /**
     * 创建用户
     *
     * @param dto 用户创建请求
     * @return 新用户ID
     */
    Long createUser(UserDTO dto);

    /**
     * 更新用户
     *
     * @param id  用户ID
     * @param dto 用户更新请求
     * @return 是否更新成功
     */
    Boolean updateUser(Long id, UserDTO dto);

    /**
     * 删除用户
     *
     * @param id 用户ID
     * @return 是否删除成功
     */
    Boolean deleteUser(Long id);

    /**
     * 更新用户状态
     *
     * @param id         用户ID
     * @param userStatus 用户状态: active-激活, inactive-禁用
     * @return 是否更新成功
     */
    Boolean updateUserStatus(Long id, String userStatus);

    /**
     * 重置用户密码
     *
     * @param id          用户ID
     * @param newPassword 新密码
     * @return 是否重置成功
     */
    Boolean resetUserPassword(Long id, String newPassword);
}
