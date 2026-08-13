package com.seiko.blog.config;

import cn.dev33.satoken.stp.StpInterface;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.seiko.blog.entity.User;
import com.seiko.blog.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * Sa-Token 权限数据接口实现
 * <p>
 * 从数据库读取当前登录用户的角色与权限，供 Sa-Token 的 role/permission 校验使用。
 */
@Component
@RequiredArgsConstructor
public class StpInterfaceImpl implements StpInterface {

    private final UserMapper userMapper;

    /**
     * 返回指定账号的权限列表
     */
    @Override
    public List<String> getPermissionList(Object loginId, String loginType) {
        // 当前系统只按角色做权限控制，不细分权限码
        return Collections.emptyList();
    }

    /**
     * 返回指定账号的角色列表
     */
    @Override
    public List<String> getRoleList(Object loginId, String loginType) {
        Long userId = parseLoginId(loginId);
        if (userId == null) {
            return Collections.emptyList();
        }

        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>()
                        .eq(User::getId, userId)
                        .eq(User::getIsDeleted, 0)
        );

        if (user == null || user.getUserRole() == null) {
            return Collections.emptyList();
        }

        return Collections.singletonList(user.getUserRole());
    }

    private Long parseLoginId(Object loginId) {
        if (loginId == null) {
            return null;
        }
        if (loginId instanceof Long) {
            return (Long) loginId;
        }
        if (loginId instanceof Number) {
            return ((Number) loginId).longValue();
        }
        try {
            return Long.valueOf(loginId.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
