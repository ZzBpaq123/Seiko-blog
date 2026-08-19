/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80410 (8.4.10)
 Source Host           : localhost:3306
 Source Schema         : seiko_blog

 Target Server Type    : MySQL
 Target Server Version : 80410 (8.4.10)
 File Encoding         : 65001

 Date: 19/08/2026 15:11:22
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for seiko_album
-- ----------------------------
DROP TABLE IF EXISTS `seiko_album`;
CREATE TABLE `seiko_album`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '相册主键ID',
  `album_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '相册名称',
  `album_desc` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '相册简介描述',
  `album_cover` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '相册封面图URL',
  `album_time` datetime NULL DEFAULT NULL COMMENT '相册所属时间',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除:0正常 1删除',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime NULL DEFAULT NULL COMMENT '逻辑删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_is_deleted`(`is_deleted` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '相册表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seiko_album
-- ----------------------------

-- ----------------------------
-- Table structure for seiko_books
-- ----------------------------
DROP TABLE IF EXISTS `seiko_books`;
CREATE TABLE `seiko_books`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '书籍主键ID',
  `book_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '书籍名称',
  `book_author` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '书籍作者',
  `book_cover` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '相册封面图URL',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '书籍介绍',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除:0正常 1删除',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime NULL DEFAULT NULL COMMENT '逻辑删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_is_deleted`(`is_deleted` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '书籍表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seiko_books
-- ----------------------------

-- ----------------------------
-- Table structure for seiko_comments
-- ----------------------------
DROP TABLE IF EXISTS `seiko_comments`;
CREATE TABLE `seiko_comments`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户邮箱',
  `author` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '评论作者(冗余字段,显示用)',
  `comment_content` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '评论内容',
  `comment_date` date NOT NULL COMMENT '评论日期',
  `avatar_color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '头像颜色(冗余字段)',
  `post_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '关联文章ID(可选)',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除: 0-正常 1-已删除',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_email` ASC) USING BTREE,
  INDEX `idx_author`(`author` ASC) USING BTREE,
  INDEX `idx_comment_date`(`comment_date` ASC) USING BTREE,
  INDEX `idx_post_id`(`post_id` ASC) USING BTREE,
  INDEX `idx_is_deleted`(`is_deleted` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '评论表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seiko_comments
-- ----------------------------

-- ----------------------------
-- Table structure for seiko_dict_items
-- ----------------------------
DROP TABLE IF EXISTS `seiko_dict_items`;
CREATE TABLE `seiko_dict_items`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `type_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所属字典类型编码',
  `item_label` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '展示文案，如 开启',
  `item_value` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '存储值，如 0',
  `item_tag` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '标签样式: green/red/yellow/blue/gray',
  `is_default` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否默认项: 0-否 1-是',
  `enabled` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否启用: 0-停用 1-启用',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除: 0-正常 1-已删除',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_type_value`(`type_code` ASC, `item_value` ASC) USING BTREE,
  INDEX `idx_enabled`(`enabled` ASC) USING BTREE,
  INDEX `idx_sort_order`(`type_code` ASC, `sort_order` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 25 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '字典项表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seiko_dict_items
-- ----------------------------
INSERT INTO `seiko_dict_items` VALUES (1, 'common_status', '开启', '0', 'green', 1, 1, 1, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (2, 'common_status', '关闭', '1', 'gray', 0, 1, 2, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (3, 'common_boolean', '已启用', 'true', 'green', 1, 1, 1, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (4, 'common_boolean', '已停用', 'false', 'gray', 0, 1, 2, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (5, 'user_status', '正常', 'active', 'green', 1, 1, 1, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (6, 'user_status', '已禁用', 'inactive', 'red', 0, 1, 2, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (7, 'user_role', '普通用户', 'user', 'blue', 1, 1, 1, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (8, 'user_role', '管理员', 'admin', 'red', 0, 1, 2, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (9, 'log_type', '操作日志', 'operation', 'blue', 1, 1, 1, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (10, 'log_type', '登录日志', 'login', 'green', 0, 1, 2, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (11, 'log_type', '错误日志', 'error', 'red', 0, 1, 3, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (12, 'log_type', '安全日志', 'security', 'yellow', 0, 1, 4, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (13, 'log_level', '调试', 'DEBUG', 'gray', 0, 1, 1, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (14, 'log_level', '信息', 'INFO', 'blue', 1, 1, 2, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (15, 'log_level', '警告', 'WARN', 'yellow', 0, 1, 3, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (16, 'log_level', '错误', 'ERROR', 'red', 0, 1, 4, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (17, 'log_status', '正常', '0', 'green', 1, 1, 1, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (18, 'log_status', '异常', '1', 'red', 0, 1, 2, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (19, 'post_status', '已发布', 'true', 'green', 1, 1, 1, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (20, 'post_status', '草稿', 'false', 'yellow', 0, 1, 2, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (21, 'movie_top', '普通', '0', 'gray', 1, 1, 1, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (22, 'movie_top', '置顶', '1', 'yellow', 0, 1, 2, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (23, 'footprint_type', '国内', 'domestic', 'blue', 1, 1, 1, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_items` VALUES (24, 'footprint_type', '国际', 'international', 'gray', 0, 1, 2, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);

-- ----------------------------
-- Table structure for seiko_dict_types
-- ----------------------------
DROP TABLE IF EXISTS `seiko_dict_types`;
CREATE TABLE `seiko_dict_types`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `type_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典类型编码，如 common_status',
  `type_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典类型名称，如 通用状态',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `enabled` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否启用: 0-停用 1-启用',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除: 0-正常 1-已删除',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_type_code`(`type_code` ASC) USING BTREE,
  INDEX `idx_enabled`(`enabled` ASC) USING BTREE,
  INDEX `idx_sort_order`(`sort_order` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '字典类型表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seiko_dict_types
-- ----------------------------
INSERT INTO `seiko_dict_types` VALUES (1, 'common_status', '通用状态', '通用开启/关闭状态，如 0-开启 1-关闭', 1, 1, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_types` VALUES (2, 'common_boolean', '通用布尔状态', '通用启用/停用状态，如 true-已启用 false-已停用', 1, 2, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_types` VALUES (3, 'user_status', '用户状态', '用户账号状态', 1, 3, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_types` VALUES (4, 'user_role', '用户角色', '用户角色类型', 1, 4, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_types` VALUES (5, 'log_type', '日志类型', '操作/登录/错误/安全日志', 1, 5, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_types` VALUES (6, 'log_level', '日志级别', 'DEBUG/INFO/WARN/ERROR', 1, 6, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_types` VALUES (7, 'log_status', '日志操作状态', '日志操作状态: 0-正常 1-异常', 1, 7, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_types` VALUES (8, 'post_status', '文章发布状态', 'true-已发布 false-草稿', 1, 8, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_types` VALUES (9, 'movie_top', '电影置顶状态', '电影是否置顶', 1, 9, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);
INSERT INTO `seiko_dict_types` VALUES (10, 'footprint_type', '足迹类型', '足迹地域类型', 1, 10, 0, '2026-08-19 11:58:23', '2026-08-19 11:58:23', NULL);

-- ----------------------------
-- Table structure for seiko_footprints
-- ----------------------------
DROP TABLE IF EXISTS `seiko_footprints`;
CREATE TABLE `seiko_footprints`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '城市名称',
  `province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '省份/州',
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '国家名称',
  `country_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '国家代码(如CN)',
  `footprint_date` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '足迹日期(格式: YYYY-MM)',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '足迹描述',
  `image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '配图URL',
  `footprint_type` enum('domestic','international') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'domestic' COMMENT '足迹类型: domestic-国内, international-国际',
  `lat` decimal(10, 8) NULL DEFAULT NULL COMMENT '纬度',
  `lng` decimal(11, 8) NULL DEFAULT NULL COMMENT '经度',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除: 0-正常 1-已删除',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_city`(`city` ASC) USING BTREE,
  INDEX `idx_country`(`country` ASC) USING BTREE,
  INDEX `idx_country_code`(`country_code` ASC) USING BTREE,
  INDEX `idx_footprint_date`(`footprint_date` ASC) USING BTREE,
  INDEX `idx_footprint_type`(`footprint_type` ASC) USING BTREE,
  INDEX `idx_is_deleted`(`is_deleted` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '足迹表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seiko_footprints
-- ----------------------------

-- ----------------------------
-- Table structure for seiko_logs
-- ----------------------------
DROP TABLE IF EXISTS `seiko_logs`;
CREATE TABLE `seiko_logs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `log_type` enum('operation','login','error','security') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'operation' COMMENT '日志类型: operation-操作日志, login-登录日志, error-错误日志, security-安全日志',
  `log_level` enum('DEBUG','INFO','WARN','ERROR') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INFO' COMMENT '日志级别: DEBUG-调试, INFO-信息, WARN-警告, ERROR-错误',
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作动作',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作描述',
  `user_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '操作用户ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作用户名(冗余字段)',
  `ip_address` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户代理',
  `request_method` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '请求方法',
  `method` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '方法名称(类全限定名.方法名)',
  `request_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '请求URL',
  `request_params` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '请求参数(JSON)',
  `json_result` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '返回参数(JSON)',
  `response_code` int NULL DEFAULT NULL COMMENT '响应状态码',
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '操作状态: 0-正常 1-异常',
  `cost_time` bigint NULL DEFAULT NULL COMMENT '消耗时间(毫秒)',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '错误信息',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除: 0-正常 1-已删除',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_log_type`(`log_type` ASC) USING BTREE,
  INDEX `idx_log_level`(`log_level` ASC) USING BTREE,
  INDEX `idx_action`(`action` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_username`(`username` ASC) USING BTREE,
  INDEX `idx_ip_address`(`ip_address` ASC) USING BTREE,
  INDEX `idx_response_code`(`response_code` ASC) USING BTREE,
  INDEX `idx_create_time`(`create_time` ASC) USING BTREE,
  INDEX `idx_is_deleted`(`is_deleted` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 65 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '日志表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seiko_logs
-- ----------------------------

-- ----------------------------
-- Table structure for seiko_movies
-- ----------------------------
DROP TABLE IF EXISTS `seiko_movies`;
CREATE TABLE `seiko_movies`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '电影主键ID',
  `movie_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '电影名称',
  `is_top` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否置顶：0否 1是',
  `rating` decimal(3, 1) NOT NULL COMMENT '影片评分(如8.9)',
  `rating_source` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '评分来源(豆瓣)',
  `tags` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '影片标签,逗号分隔',
  `synopsis` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '电影剧情简介',
  `backdrop` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '横版背景大图URL',
  `duration` int NULL DEFAULT NULL COMMENT '影片时长(单位:分钟)',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除:0正常,1已删',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_is_deleted`(`is_deleted` ASC) USING BTREE,
  INDEX `idx_is_top`(`is_top` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '电影信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seiko_movies
-- ----------------------------

-- ----------------------------
-- Table structure for seiko_notice
-- ----------------------------
DROP TABLE IF EXISTS `seiko_notice`;
CREATE TABLE `seiko_notice`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `notice_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '公告标题',
  `notice_content` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '公告内容',
  `notice_link` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '跳转链接',
  `sort_order` int UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序序号',
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否启用: 0-禁用 1-启用',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除: 0-正常 1-已删除',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_sort_order`(`sort_order` ASC) USING BTREE,
  INDEX `idx_is_enabled`(`is_enabled` ASC) USING BTREE,
  INDEX `idx_is_deleted`(`is_deleted` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '公告表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seiko_notice
-- ----------------------------

-- ----------------------------
-- Table structure for seiko_photos
-- ----------------------------
DROP TABLE IF EXISTS `seiko_photos`;
CREATE TABLE `seiko_photos`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `album_id` bigint NOT NULL COMMENT '相册表ID',
  `photo_src` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '图片URL地址',
  `photo_alt` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '图片替代文本',
  `photo_width` int UNSIGNED NOT NULL COMMENT '图片宽度(px)',
  `photo_height` int UNSIGNED NOT NULL COMMENT '图片高度(px)',
  `photo_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '图片标题',
  `photo_location` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '拍摄地点',
  `photo_date` date NULL DEFAULT NULL COMMENT '拍摄日期',
  `sort_order` int UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序序号',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除: 0-正常 1-已删除',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_photo_date`(`photo_date` ASC) USING BTREE,
  INDEX `idx_photo_location`(`photo_location` ASC) USING BTREE,
  INDEX `idx_sort_order`(`sort_order` ASC) USING BTREE,
  INDEX `idx_is_deleted`(`is_deleted` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '照片表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seiko_photos
-- ----------------------------

-- ----------------------------
-- Table structure for seiko_post_tags
-- ----------------------------
DROP TABLE IF EXISTS `seiko_post_tags`;
CREATE TABLE `seiko_post_tags`  (
  `post_id` bigint UNSIGNED NOT NULL COMMENT '文章ID',
  `tag_id` bigint UNSIGNED NOT NULL COMMENT '标签ID',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`post_id`, `tag_id`) USING BTREE,
  INDEX `idx_tag_id`(`tag_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '文章标签关联表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seiko_post_tags
-- ----------------------------

-- ----------------------------
-- Table structure for seiko_posts
-- ----------------------------
DROP TABLE IF EXISTS `seiko_posts`;
CREATE TABLE `seiko_posts`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'URL友好标识',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文章标题',
  `excerpt` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文章摘要',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文章内容(Markdown)',
  `cover` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '封面图路径',
  `author` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Seiko' COMMENT '作者',
  `read_num` int UNSIGNED NOT NULL DEFAULT 0 COMMENT '阅读次数',
  `is_published` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否发布: 0-草稿 1-已发布',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除: 0-正常 1-已删除',
  `publish_time` datetime NULL DEFAULT NULL COMMENT '发布时间',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_slug`(`slug` ASC) USING BTREE,
  INDEX `idx_author`(`author` ASC) USING BTREE,
  INDEX `idx_publish_time`(`publish_time` ASC) USING BTREE,
  INDEX `idx_is_published`(`is_published` ASC, `publish_time` ASC) USING BTREE,
  INDEX `idx_is_deleted`(`is_deleted` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '文章表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seiko_posts
-- ----------------------------

-- ----------------------------
-- Table structure for seiko_resources
-- ----------------------------
DROP TABLE IF EXISTS `seiko_resources`;
CREATE TABLE `seiko_resources`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '资源主键ID',
  `resource_icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '资源图标',
  `resource_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资源名称',
  `resource_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资源网址',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '资源分类(如:开发工具/设计资源/学习)',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '资源简介',
  `sort_order` int UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序序号(越小越靠前)',
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否启用: 0-禁用 1-启用',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除: 0-正常 1-已删除',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_category`(`category` ASC) USING BTREE,
  INDEX `idx_sort_order`(`sort_order` ASC) USING BTREE,
  INDEX `idx_is_enabled`(`is_enabled` ASC) USING BTREE,
  INDEX `idx_is_deleted`(`is_deleted` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '资源目录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seiko_resources
-- ----------------------------

-- ----------------------------
-- Table structure for seiko_tags
-- ----------------------------
DROP TABLE IF EXISTS `seiko_tags`;
CREATE TABLE `seiko_tags`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标签名称',
  `slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'URL友好标识',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除: 0-正常 1-已删除',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_name`(`name` ASC) USING BTREE,
  UNIQUE INDEX `uk_slug`(`slug` ASC) USING BTREE,
  INDEX `idx_is_deleted`(`is_deleted` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '标签表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seiko_tags
-- ----------------------------

-- ----------------------------
-- Table structure for seiko_users
-- ----------------------------
DROP TABLE IF EXISTS `seiko_users`;
CREATE TABLE `seiko_users`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名(登录用)',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '昵称(显示用)',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邮箱地址',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码哈希',
  `avatar` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '头像URL',
  `avatar_color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '#FFB7B2' COMMENT '默认头像背景色',
  `bio` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '个人简介',
  `website` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '个人网站',
  `user_role` enum('admin','user') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user' COMMENT '用户角色: admin-管理员, user-普通用户',
  `user_status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '用户状态: active-激活, inactive-禁用',
  `last_login_time` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除: 0-正常 1-已删除',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `uk_email`(`email` ASC) USING BTREE,
  INDEX `idx_nickname`(`nickname` ASC) USING BTREE,
  INDEX `idx_user_role`(`user_role` ASC) USING BTREE,
  INDEX `idx_user_status`(`user_status` ASC) USING BTREE,
  INDEX `idx_is_deleted`(`is_deleted` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seiko_users
-- ----------------------------
INSERT INTO `seiko_users` VALUES (2, 'seiko', 'seiko', '1302183481@qq.com', 'e10adc3949ba59abbe56e057f20f883e', NULL, '#FFB7B2', NULL, NULL, 'admin', 'active', '2026-08-19 11:34:51', 0, '2026-07-29 09:51:18', '2026-07-29 09:52:06', NULL);

SET FOREIGN_KEY_CHECKS = 1;
