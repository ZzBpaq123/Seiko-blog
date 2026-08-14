package com.seiko.blog.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.seiko.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.util.Date;

/**
 * 用户表实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("seiko_users")
public class User extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 用户名(登录用)
     */
    private String username;

    /**
     * 昵称(显示用)
     */
    private String nickname;

    /**
     * 邮箱地址
     */
    private String email;

    /**
     * 密码哈希
     */
    @TableField("password_hash")
    private String passwordHash;

    /**
     * 头像URL
     */
    private String avatar;

    /**
     * 默认头像背景色
     */
    @TableField("avatar_color")
    private String avatarColor;

    /**
     * 个人简介
     */
    private String bio;

    /**
     * 个人网站
     */
    private String website;

    /**
     * 用户角色: admin-管理员, user-普通用户
     */
    @TableField("user_role")
    private String userRole;

    /**
     * 用户状态: active-激活, inactive-禁用
     */
    @TableField("user_status")
    private String userStatus;

    /**
     * 最后登录时间
     */
    @TableField("last_login_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date lastLoginTime;
}
