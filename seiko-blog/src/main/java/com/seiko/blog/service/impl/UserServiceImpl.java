package com.seiko.blog.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.crypto.SecureUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.common.exception.BusinessException;
import com.seiko.common.result.ResultCode;
import com.seiko.blog.dto.LoginDTO;
import com.seiko.blog.dto.RegisterDTO;
import com.seiko.blog.dto.UserDTO;
import com.seiko.blog.entity.User;
import com.seiko.blog.enums.AvatarColor;
import com.seiko.blog.enums.UserRole;
import com.seiko.blog.enums.UserStatus;
import com.seiko.blog.mapper.UserMapper;
import com.seiko.blog.service.UserService;
import com.seiko.blog.vo.LoginVO;
import com.seiko.blog.vo.UserVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    @Override
    public LoginVO login(LoginDTO loginDTO) {
        // 根据用户名查询用户
        User user = getUserByUsername(loginDTO.getUsername());
        if (user == null) {
            throw new BusinessException(ResultCode.LOGIN_ERROR);
        }

        // 验证密码
        String passwordHash = SecureUtil.md5(loginDTO.getPassword());
        if (!passwordHash.equals(user.getPasswordHash())) {
            throw new BusinessException(ResultCode.LOGIN_ERROR);
        }

        // 检查用户状态
        if (!UserStatus.ACTIVE.getValue().equals(user.getUserStatus())) {
            throw new BusinessException(ResultCode.USER_DISABLED);
        }

        // 更新最后登录时间
        user.setLastLoginTime(new Date());
        userMapper.updateById(user);

        // Sa-Token 登录，并将用户角色写入 Session，供后续权限校验使用
        StpUtil.login(user.getId());
        StpUtil.getSession().set("userRole", user.getUserRole());

        // 构建登录响应
        return buildLoginVO(user, StpUtil.getTokenValue());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LoginVO register(RegisterDTO registerDTO) {
        // 检查用户名是否已存在
        User existUser = getUserByUsername(registerDTO.getUsername());
        if (existUser != null) {
            throw new BusinessException(ResultCode.USERNAME_EXISTS);
        }

        // 创建新用户
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setNickname(registerDTO.getNickname());
        user.setEmail(registerDTO.getEmail());
        user.setPasswordHash(SecureUtil.md5(registerDTO.getPassword()));
        user.setUserRole(UserRole.USER.getValue());
        user.setUserStatus(UserStatus.ACTIVE.getValue());
        user.setAvatarColor(AvatarColor.DEFAULT.getValue());

        userMapper.insert(user);
        log.info("新用户注册: {}", user.getUsername());

        // 自动登录
        StpUtil.login(user.getId());

        return buildLoginVO(user, StpUtil.getTokenValue());
    }

    @Override
    public void logout() {
        StpUtil.logout();
    }

    @Override
    public UserVO getCurrentUser() {
        long userId = StpUtil.getLoginIdAsLong();
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(500, "用户不存在");
        }
        return convertToUserVO(user);
    }

    @Override
    public User getUserByUsername(String username) {
        return userMapper.selectOne(
                new LambdaQueryWrapper<User>()
                        .eq(User::getUsername, username)
                        .eq(User::getIsDeleted, 0)
        );
    }

    @Override
    public UserVO convertToUserVO(User user) {
        if (user == null) {
            return null;
        }
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setNickname(user.getNickname());
        vo.setEmail(user.getEmail());
        vo.setAvatar(user.getAvatar());
        vo.setAvatarColor(user.getAvatarColor());
        vo.setBio(user.getBio());
        vo.setWebsite(user.getWebsite());
        vo.setUserRole(user.getUserRole());
        vo.setUserStatus(user.getUserStatus());
        vo.setLastLoginTime(user.getLastLoginTime());
        vo.setCreateTime(user.getCreateTime());
        return vo;
    }

    @Override
    public Page<UserVO> getUserPage(long page, long size, String username, String email, String userRole, String userStatus) {
        Page<User> userPage = new Page<>(page, size);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (username != null && !username.isBlank()) {
            String keyword = username.trim();
            wrapper.and(w -> w.like(User::getUsername, keyword).or().like(User::getNickname, keyword));
        }
        if (email != null && !email.isBlank()) {
            wrapper.like(User::getEmail, email.trim());
        }
        if (userRole != null && !userRole.isBlank()) {
            wrapper.eq(User::getUserRole, userRole.trim());
        }
        if (userStatus != null && !userStatus.isBlank()) {
            wrapper.eq(User::getUserStatus, userStatus.trim());
        }
        wrapper.orderByDesc(User::getId);

        Page<User> result = userMapper.selectPage(userPage, wrapper);

        List<UserVO> voList = result.getRecords().stream()
                .map(this::convertToUserVO)
                .collect(Collectors.toList());

        Page<UserVO> voPage = new Page<>();
        BeanUtils.copyProperties(result, voPage);
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    public UserVO getUserById(Long id) {
        User user = userMapper.selectById(id);
        if (user == null || user.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return convertToUserVO(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createUser(UserDTO dto) {
        // 创建时密码必填
        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "密码不能为空");
        }
        // 检查用户名是否已存在
        if (getUserByUsername(dto.getUsername()) != null) {
            throw new BusinessException(ResultCode.USERNAME_EXISTS);
        }

        User user = new User();
        BeanUtils.copyProperties(dto, user);
        user.setPasswordHash(SecureUtil.md5(dto.getPassword()));
        user.setUserRole(dto.getUserRole() != null && !dto.getUserRole().isBlank()
                ? dto.getUserRole() : UserRole.USER.getValue());
        user.setUserStatus(dto.getUserStatus() != null && !dto.getUserStatus().isBlank()
                ? dto.getUserStatus() : UserStatus.ACTIVE.getValue());
        if (user.getAvatarColor() == null || user.getAvatarColor().isBlank()) {
            user.setAvatarColor(AvatarColor.DEFAULT.getValue());
        }

        userMapper.insert(user);
        log.info("后台创建用户: {}", user.getUsername());
        return user.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateUser(Long id, UserDTO dto) {
        User user = userMapper.selectById(id);
        if (user == null || user.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        // 用户名变更时校验唯一性
        if (!user.getUsername().equals(dto.getUsername())
                && getUserByUsername(dto.getUsername()) != null) {
            throw new BusinessException(ResultCode.USERNAME_EXISTS);
        }

        // 密码留空表示不修改，避免被空值覆盖
        String originPasswordHash = user.getPasswordHash();
        BeanUtils.copyProperties(dto, user);
        user.setId(id);
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPasswordHash(SecureUtil.md5(dto.getPassword()));
        } else {
            user.setPasswordHash(originPasswordHash);
        }

        return userMapper.updateById(user) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteUser(Long id) {
        User user = userMapper.selectById(id);
        if (user == null || user.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return userMapper.deleteById(id) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateUserStatus(Long id, String userStatus) {
        if (UserStatus.fromValue(userStatus) == null) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "用户状态不合法");
        }
        User user = userMapper.selectById(id);
        if (user == null || user.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        User update = new User();
        update.setId(id);
        update.setUserStatus(userStatus);
        return userMapper.updateById(update) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean resetUserPassword(Long id, String newPassword) {
        if (newPassword == null || newPassword.isBlank()) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "新密码不能为空");
        }
        if (newPassword.length() < 6 || newPassword.length() > 20) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "密码长度在6-20之间");
        }

        User user = userMapper.selectById(id);
        if (user == null || user.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }

        User update = new User();
        update.setId(id);
        update.setPasswordHash(SecureUtil.md5(newPassword));
        return userMapper.updateById(update) > 0;
    }

    private LoginVO buildLoginVO(User user, String token) {
        LoginVO vo = new LoginVO();
        vo.setToken(token);
        vo.setUser(convertToUserVO(user));
        return vo;
    }
}
