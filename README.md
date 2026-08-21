# Seiko Blog 个人博客管理系统

## 项目介绍

Seiko Blog 是一个基于现代化技术栈开发的个人博客管理系统，采用前后端分离架构。后端基于 Spring Boot 提供 REST API，并配套两个 Next.js 前端：面向访客的公开博客站点，以及面向管理员的内容管理后台。

## 软件架构

采用前后端分离架构：

- **后端**（`seiko-blog/` + `seiko-common/`）：Spring Boot 3.4 REST API，端口 `1001`
- **公开前台**（`seiko-blog-ui/`）：Next.js 16（App Router），数据驱动页面采用 SSG/ISR（`revalidate = 3600`，1 小时），访问 `/api/blog/**`，端口 `3000`
- **后台管理**（`seiko-manage/`）：Next.js 16 客户端渲染的 CRUD 控制台，访问 `/api/manage/**`，端口 `3001`
- **数据库脚本**（`sql/seiko_blog.sql`）、**开发文档**（`docs/`）

### 后端技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 21 | 开发语言 |
| Spring Boot | 3.4.0 | 应用框架 |
| MySQL | 8.x | 关系型数据库 |
| MyBatis-Plus | 3.5.15 | ORM 框架（分页、逻辑删除） |
| Redis | 7.x | Spring Cache 缓存、Sa-Token 会话存储、限流 |
| Sa-Token | 1.39.0 | 权限认证框架（UUID Token、角色权限） |
| springdoc-openapi | 2.8.3 | OpenAPI 3.x 接口文档（Swagger UI） |
| Hutool | 5.8.25 | 工具类库（含 MD5 加密） |
| Spring Boot Mail | 3.4.0 | 邮箱验证码发送（SMTP） |
| Spring Validation / AOP | - | 参数校验 / 面向切面日志 |
| Lombok | - | 样板代码简化 |
| Maven | 3.9+ | 构建工具 |

### 前端技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 16.1.6 | App Router |
| React | 19.2.3 | UI 框架（启用 React Compiler） |
| TypeScript | 5 | 严格模式，路径别名 `@/*` → `src/*` |
| Tailwind CSS | v4 | 原子化样式 |
| Axios | - | API 请求封装（拦截器、错误码映射） |
| react-markdown + remark-gfm | - | Markdown 渲染 |
| lucide-react + simple-icons | - | 图标库 |
| next-themes | - | 后台明暗主题切换 |
| 高德地图 JS API | 2.0 | 足迹地图展示与地图选点 |

### 功能模块

- **用户模块** - 注册（注册后自动登录）、登录、登出、当前用户信息、登录状态检查；管理端用户 CRUD、启用/禁用、重置密码、角色管理
- **文章 / 标签模块** - 文章 CRUD、slug、发布状态、标签自动创建与按标签筛选；基于 Redis 的阅读数计数与定时回刷
- **足迹模块** - 旅行足迹 CRUD，国内 / 国际筛选，经纬度 + 高德地图展示；管理端支持地图点击选点
- **相册 / 照片模块** - 相册 CRUD、照片 CRUD、批量新增、按拍摄地点筛选
- **评论模块** - 评论 CRUD、按文章筛选；前台发表评论需携带邮箱验证码
- **公告模块** - 公告 CRUD、启用开关、排序
- **书籍 / 电影模块** - 书籍、电影 CRUD；电影支持置顶与评分
- **资源模块** - 资源 CRUD、分类分组、启用开关
- **文件上传** - 图片上传（本地存储），类型 / 大小校验，静态资源映射
- **系统模块** - 系统版本、数据库 / Redis / Java 状态、内存等信息
- **数据统计模块** - 统计概览（文章、评论、相册、照片、阅读总量）、阅读趋势、内容新建趋势
- **日志模块** - 基于 AOP + 异步任务的操作日志自动记录（登录 / 操作 / 错误 / 安全）
- **权限控制** - 基于 Sa-Token 的角色权限（`admin`），按 `/api/blog`（公开读）与 `/api/manage`（管理员）路由前缀拆分
- **基础设施** - Redis 缓存（Spring Cache）、登录限流（账号 + IP 双维度）、邮箱验证码发送限流（邮箱冷却 + IP 每小时上限）、阅读数定时回刷任务

## 项目结构

```
seiko/
├── pom.xml                                  # Maven 父 POM（聚合 seiko-common、seiko-blog）
├── seiko-common/                            # 通用模块
│   └── src/main/java/com/seiko/common/      # Result / ResultCode、BaseEntity、BusinessException、@OperationLog、IpUtils 等
├── seiko-blog/                              # 后端 Spring Boot 服务（端口 1001）
│   ├── src/main/java/com/seiko/blog/
│   │   ├── controller/blog/                 # 公开接口 /api/blog/**（XxxController）
│   │   ├── controller/manage/               # 管理接口 /api/manage/**（XxxManageController）
│   │   ├── service/                         # 业务接口
│   │   ├── service/impl/                    # 业务实现
│   │   ├── mapper/                          # MyBatis-Plus Mapper
│   │   ├── entity/ dto/ vo/                 # 实体 / 传输对象 / 视图对象
│   │   ├── config/                          # Sa-Token、Redis 缓存、CORS、上传、验证码等配置
│   │   ├── component/                       # 登录限流、邮箱限流、邮件服务等组件
│   │   ├── task/                            # 阅读数回刷、异步日志落库
│   │   ├── aspect/ interceptor/             # 操作日志 AOP 切面、日志拦截器
│   │   ├── enums/ common/                   # 枚举、全局异常处理
│   │   └── SeikoBlogApplication.java
│   ├── src/main/resources/                  # application.yml / application-dev.yml / application-prod.yml
│   ├── src/test/                            # 单元测试（登录限流等）
│   └── pom.xml
├── seiko-blog-ui/                           # 公开前台（Next.js，端口 3000）
├── seiko-manage/                            # 后台管理面板（Next.js，端口 3001）
├── sql/seiko_blog.sql                       # 数据库建表脚本
├── docs/                                    # 开发规范与设计文档
└── README.md
```

## 安装教程

1. **环境准备**
   - JDK 21+
   - MySQL 8.0+
   - Redis 7.0+
   - Maven 3.9+
   - Node.js 20+（运行前端）

2. **数据库初始化**
   ```bash
   # 创建数据库
   CREATE DATABASE seiko_blog DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

   # 执行建表脚本
   mysql -u root -p seiko_blog < sql/seiko_blog.sql
   ```

3. **配置文件修改**（`seiko-blog/src/main/resources/application-dev.yml`）
   ```yaml
   spring:
     # 数据源配置
     datasource:
       driver-class-name: com.mysql.cj.jdbc.Driver
       url: jdbc:mysql://localhost:3306/seiko_blog?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
       username: root
       password: your_password

     # Redis 配置
     data:
       redis:
         host: localhost
         port: 6379
         database: 10
         password:
         timeout: 3000ms
   ```

   文件上传与邮箱验证码配置位于 `application.yml` 的 `blog` 节点：
   ```yaml
   blog:
     upload:
       path: ${UPLOAD_PATH:./uploads}  # 文件存储目录，Windows 示例：D:\blog\uploads
       url-prefix: /uploads        # 静态访问前缀
     security:
       email-code:
         enabled: true             # 是否启用邮箱验证码
         code-length: 6            # 验证码长度
         code-ttl-seconds: 300     # 验证码有效期
         resend-cooldown-seconds: 60  # 同一邮箱重发冷却
         ip-max-sends-per-hour: 3  # 同一 IP 每小时发送上限
   ```

   邮箱 SMTP 配置位于 `application.yml` 的 `spring.mail` 节点，用户名与授权码通过环境变量注入：
   ```yaml
   spring:
     mail:
       host: smtp.qq.com
       port: 465
       username: ${MAIL_USERNAME:}
       password: ${MAIL_PASSWORD:}
       default-encoding: UTF-8
   ```

   生产环境（`application-prod.yml`）通过 `MYSQL_HOST`、`MYSQL_PASSWORD`、`REDIS_HOST`、`REDIS_PASSWORD`、`MAIL_USERNAME`、`MAIL_PASSWORD` 等环境变量注入；敏感配置也可复制为被 `.gitignore` 忽略的 `application-local.yml`。

4. **后端编译运行**
   ```bash
   # 在项目根目录编译
   mvn clean package -DskipTests

   # 运行测试
   mvn test

   # 运行项目（端口 1001）
   java -jar seiko-blog/target/seiko-blog-1.0.0.jar
   # 或
   mvn -pl seiko-blog spring-boot:run
   ```

5. **前端运行**
   ```bash
   # 公开前台（端口 3000）
   cd seiko-blog-ui && npm install && npm run dev

   # 后台管理（端口 3001）
   cd seiko-manage && npm install && npm run dev
   ```

   前端通过 `NEXT_PUBLIC_API_BASE_URL` 指定后端地址（公开前台默认 `http://localhost:1001/api/blog`，后台管理默认 `http://localhost:1001/api`）。首次运行可复制 `seiko-blog-ui/.env.example` 与 `seiko-manage/.env.example` 为对应的 `.env.local` 并按需配置；足迹页地图展示需要 `NEXT_PUBLIC_AMAP_KEY`，后台足迹表单地图选点还需要 `NEXT_PUBLIC_AMAP_SECURITY_CODE`。

## 使用说明

### API 接口文档（Swagger）

| 文档类型 | 访问地址 | 说明 |
|---------|---------|------|
| Swagger UI | http://localhost:1001/swagger-ui.html | 在线接口文档与调试 |
| OpenAPI JSON | http://localhost:1001/v3/api-docs | 接口 JSON 数据 |

### 接口路由约定

API 按前缀分为两类，每个内容模块通常对应公开 `XxxController` 与管理 `XxxManageController`：

- `/api/blog/**` - 公开读接口（文章、足迹、照片、评论、公告、书籍、电影、资源、验证码）。例外：发表评论 `/api/blog/comments` 需携带邮箱验证码。
- `/api/manage/**` - 管理接口，默认需登录且具备 `admin` 角色；其中 `user/login`、`user/register`、`user/check` 公开，`user/logout`、`user/info` 仅需登录。

Token 通过请求头 `token` 传递（对应 Sa-Token 的 `token-name` 配置），前端登录后将 Token 存入 `localStorage`，由 Axios 请求拦截器统一注入。

### 主要接口

| 接口路径 | 说明 | 权限 |
|---------|------|------|
| POST /api/manage/user/login | 用户登录 | 公开 |
| POST /api/manage/user/register | 用户注册（自动登录） | 公开 |
| GET /api/manage/user/check | 检查登录状态 | 公开 |
| GET /api/manage/user/info | 当前用户信息 | 登录 |
| POST /api/blog/code/email/code | 发送邮箱验证码 | 公开 |
| POST /api/blog/comments | 发表评论（需邮箱验证码） | 公开 |
| GET /api/blog/posts | 文章列表（分页） | 公开 |
| GET /api/blog/posts/{slug} | 文章详情（阅读数 +1） | 公开 |
| GET /api/blog/posts/tag-counts | 标签及文章数量统计 | 公开 |
| GET /api/manage/stats | 数据统计概览 | 管理员 |
| GET /api/manage/system/info | 系统信息 | 管理员 |
| POST /api/manage/upload/image | 图片上传 | 管理员 |

各模块管理 CRUD 统一位于 `/api/manage/{post,tag,footprint,photo,album,comment,notice,book,movie,resource,user}/**`，Swagger 中可查看完整接口清单。

### 默认账号

- 项目约定管理员：`seiko` / `123456`

### 公开前台页面

- `/` 首页：Hero 全屏背景、打字机动画、波浪动画、公告轮播、侧边栏个人资料 / 运行时间 / 3D 技术球 / 标签云 / 最新评论
- `/blog`、`/blog/[slug]` 文章列表与详情：Markdown 渲染、目录（TOC）、AI 摘要、阅读悬浮按钮
- `/about/myself` 关于我：全屏水平滑动四屏交互页（Hero、活跃度日历热力图、个人介绍、作品展示）
- `/footprint` 足迹：高德地图展示旅行足迹，支持国内 / 国际筛选
- `/gallery` 相册：星空入场动画、按相册选择、照片网格与灯箱
- `/explore/book`、`/explore/movie`、`/explore/game`、`/explore/ranking` 探索页：书籍 / 电影（后端 API）、游戏 / 硬件排行（静态数据）

### 后台管理页面

后台为客户端渲染的 CRUD 控制台，包含仪表盘（统计概览、阅读量点阵图、内容新建趋势图）、登录页，以及文章、标签、评论、足迹、相册 / 照片、公告、书籍、电影、资源、用户等模块的列表 / 新建 / 编辑页面。提供 Markdown 分栏编辑器、图片上传、高德地图选点、明暗主题切换等通用能力。

## 代码规范

**命名规范：**

| 类型 | 规范 | 示例 |
|------|------|------|
| Controller（公开） | `XxxController` | `PostController` |
| Controller（管理） | `XxxManageController` | `PostManageController` |
| Service 接口 | `XxxService` | `UserService` |
| Service 实现 | `XxxServiceImpl` | `UserServiceImpl` |
| Mapper | `XxxMapper` | `UserMapper` |
| Entity | `Xxx`（对应表名） | `User` |
| DTO | `XxxDTO` | `LoginDTO` |
| VO | `XxxVO` | `LoginVO` |
| 常量 | `UPPER_SNAKE_CASE` | `USER_ROLE` |
| 包名 | 全小写 | `com.seiko.blog` |

**Controller 层规范：**
```java
@Tag(name = "用户模块", description = "用户登录注册相关接口")
@RestController
@RequestMapping("/api/manage/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "用户登录", description = "用户登录获取Token")
    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO loginDTO) {
        return Result.success(userService.login(loginDTO));
    }
}
```

**Service 层规范：**
```java
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LoginVO login(LoginDTO loginDTO) {
        // 业务逻辑
        log.info("用户登录: {}", username);
        return result;
    }
}
```

**Mapper 层规范：**
```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 使用 MyBatis-Plus LambdaQueryWrapper
}
```

**Entity 层规范（继承 `seiko-common` 的 `BaseEntity`，自带 ID、创建/更新时间、逻辑删除字段）：**
```java
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("seiko_users")
public class User extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @TableField("password_hash")
    private String passwordHash;
}
```

**DTO / VO 层规范：**
```java
@Data
@Schema(description = "登录请求")
public class LoginDTO {

    @NotBlank(message = "用户名不能为空")
    @Schema(description = "用户名")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Schema(description = "密码")
    private String password;
}
```

**统一响应 `Result` 规范：**
```java
// 成功响应
Result.success()
Result.success(data)
Result.success("操作成功", data)

// 错误响应
Result.error()
Result.error("错误信息")
Result.error(400, "参数错误")
Result.error(ResultCode.USERNAME_EXISTS)
```

**异常处理规范：**
```java
// 业务异常
throw new BusinessException(ResultCode.LOGIN_ERROR);
throw new BusinessException(ResultCode.NOT_FOUND, "用户不存在");
throw new BusinessException("自定义错误信息");
```

**操作日志规范：**
```java
@OperationLog(
    logType = "operation",
    logLevel = "INFO",
    action = "删除文章",
    description = "根据 ID 删除文章",
    isSaveRequestData = true,
    isSaveResponseData = true,
    excludeParamNames = {}
)
@Operation(summary = "删除文章")
@DeleteMapping("/{id}")
public Result<Void> delete(@PathVariable Long id) {
    // 业务逻辑
}
```

仅 `controller/manage` 后台包下标注了 `@OperationLog` 的接口会记录日志，`controller/blog` 公开接口不记录；
动作名取自注解的 `action`，未标注的接口不会写入日志表。

日志切面自动记录请求入参（`request_params`）、返回参数（`json_result`）、错误信息（`error_message`）、
操作状态（`status`，0-正常 1-异常）、耗时（`cost_time`）与方法签名（`method`）。密码等敏感字段默认不入库，
可通过 `excludeParamNames` 追加排除字段，`isSaveRequestData` / `isSaveResponseData` 可整体关闭入参/返参记录。

**Swagger 注解规范：**
- Controller：`@Tag`、`@Operation`、`@Parameters`、`@Parameter`
- DTO/VO：`@Schema`
- 参数校验：`@NotBlank`、`@NotNull`、`@Size`、`@Email`、`@Pattern`

**事务规范：**
```java
@Transactional(rollbackFor = Exception.class)
public void method() {
    // 需要事务的方法
}
```

## 参与贡献

1. Fork 本仓库
2. 新建 `Feat_xxx` 分支
3. 提交代码
4. 新建 Pull Request

## 开发计划

- [x] 项目基础架构搭建（Maven 多模块：`seiko-common` + `seiko-blog`）
- [x] Swagger 接口文档集成
- [x] 用户认证模块（Sa-Token + MD5）
- [x] 文章管理模块（标签 + Redis 阅读数计数）
- [x] 评论系统（邮箱验证码）
- [x] 足迹 / 相册 / 公告 / 书籍 / 电影 / 资源等完整 CRUD
- [x] 文件上传功能
- [x] 登录限流与邮箱验证码限流
- [x] AOP 操作日志
- [x] 数据统计报表（后端接口 + 管理端图表）
- [x] 公开前台站点（seiko-blog-ui）
- [x] 后台管理系统（seiko-manage）
- [x] 操作日志查询 / 管理界面
- [ ] AI 摘要接入后端数据

## 许可证

本项目采用 MIT License。
