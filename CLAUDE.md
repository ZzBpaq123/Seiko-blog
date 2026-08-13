# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Seiko Blog is a personal blog management system with a Spring Boot backend and **two** Next.js frontends:
- `seiko-blog-ui/` – public-facing static blog site (SSG), fetches from `/api/blog/**`. Runs on port 3000.
- `seiko-manage/` – admin management panel (CRUD dashboard), fetches from `/api/manage/**`. Runs on port 3001.

The backend provides REST APIs for user auth, blog posts, footprints, photos/albums, comments, notices, books, movies, resources, file upload, and system info.

## Technology Stack

### Backend
- **Java** 21 + **Spring Boot** 3.4.0
- **MySQL** 8.x + **MyBatis-Plus** 3.5.15
- **Redis** 7.x (session storage via Sa-Token)
- **Sa-Token** 1.39.0 (auth, UUID token style)
- **springdoc-openapi** 2.8.3 (Swagger UI)
- **Hutool** 5.8.25 + **Lombok**
- **Spring Validation** (DTO parameter validation)

### Frontends
Both apps share the same core stack:
- **Next.js** 16.1.6 + **React** 19.2.3
- **TypeScript** 5 (strict mode, path alias `@/*` → `src/*`)
- **Tailwind CSS** v4 (`@import "tailwindcss"`, `@theme inline`)
- **React Compiler** enabled (`babel-plugin-react-compiler`) – no manual `useMemo`/`useCallback`

- `seiko-blog-ui/` (public): SSG site, `lucide-react` + `simple-icons`. Renders at build time.
- `seiko-manage/` (admin): CRUD dashboard, `next-themes`, `react-markdown` + `remark-gfm`. Client-side data fetching with shared hooks (`usePagedList`, `useEntityForm`, `useDebounce`).

## Build Commands

### Backend
```bash
mvn clean compile
mvn clean package -DskipTests
mvn test
mvn test -pl seiko-blog -Dtest=UserServiceTest
mvn test -pl seiko-blog -Dtest=UserServiceTest#testLogin
mvn -pl seiko-blog spring-boot:run
java -jar seiko-blog/target/seiko-blog-backend-*.jar
```

### Frontends
```bash
# Public blog (seiko-blog-ui/) — port 3000
cd seiko-blog-ui
npm install
npm run dev        # http://localhost:3000
npm run build      # SSG output to .next/
npm run start
npm run lint

# Admin panel (seiko-manage/) — port 3001
cd seiko-manage
npm install
npm run dev        # http://localhost:3001
npm run build
npm run start      # serves on port 3001
npm run lint
```

## Backend Architecture

Base package: `com.seiko.blog`
Server port: `1001`

### Core Patterns

**BaseEntity**: All entities extend this. Fields: `id` (auto), `createTime`, `updateTime`, `isDeleted` (logic delete, default 0), `deleteTime`. MyBatis-Plus globally configures `logic-delete-field: isDeleted`.

**Result<T>**: Uniform API response with `code`/`message`/`data`. Use `Result.success(data)` or `Result.error(ResultCode.XXX)`. HTTP status is always 200; business status is in the JSON `code` field.

**ResultCode**: Enum of response codes. Standard HTTP codes (200, 400, 401, 403, 404, 500) plus business codes in 1001+ range: `LOGIN_ERROR`, `TOKEN_INVALID`, `USER_DISABLED`, `USERNAME_EXISTS`, `OLD_PASSWORD_ERROR`.

**BusinessException**: Runtime exception carrying a `code`. Thrown in services, caught by `GlobalExceptionHandler` which returns a `Result.error(...)`. Also handles validation errors (`@Valid`/`@Validated`), Sa-Token auth exceptions (`NotLoginException`, `NotPermissionException`, `NotRoleException`), and generic `Exception`.

**Sa-Token Security**: Configured in `SaTokenConfig.java` via `SaServletFilter` (route + HTTP-method matching). The API is split into two prefixes:
- `/api/blog/**` – **public** read APIs (posts, footprints, photos, comments, notices, books, movies, resources). Exception: comment **creation** (`/api/blog/comments`) still requires login.
- `/api/manage/**` – **admin** APIs (one `XxxManageController` per module). Require login + `admin` role.

Auth rules (in order):
- Public (no auth): `/api/manage/user/login`, `/api/manage/user/register`, `/api/manage/user/check`; all `/api/blog/**` except paths containing `/comments`; Swagger docs; uploaded files (`${blog.upload.url-prefix}/**`).
- Login required only: `/api/manage/user/logout`, `/api/manage/user/info`.
- Admin role required: everything else under `/api/manage/**`.
- Token header name: `Authorization`.

**Controller convention**: Each module typically has two controllers — a public `XxxController` mapped under `/api/blog/...` (read-only) and an admin `XxxManageController` mapped under `/api/manage/...` (full CRUD).

**Password Hashing**: Uses `SecureUtil.md5()` (Hutool), not BCrypt.

### Implemented Modules
Each module (except read-only/utility ones) has a public `XxxController` (`/api/blog/...`) and an admin `XxxManageController` (`/api/manage/...`).
- **User** – registration, login (auto-login after register), logout, current user info; admin user management
- **Post** – article CRUD, tags, pagination (`PageResult<PostListVO>`); Redis-backed read-count (see below)
- **Footprint** – travel footprint CRUD, type filter (`domestic`/`international`), lat/lng for map
- **Photo / Album** – gallery photo CRUD, batch create, location filter; Album CRUD
- **Comment** – comment CRUD, filter by post/user; public can create via `/api/blog/comments` (login required)
- **Notice** – notice CRUD, enabled toggle, sort order
- **Book** – book list/CRUD
- **Movie** – movie list/CRUD, top flag and rating
- **Resource** – resource management CRUD (`/api/blog/resource`, `/api/manage/resource`)
- **Upload** – file upload endpoint (`/api/manage/upload`); files served from `${blog.upload.url-prefix}`
- **System** – system info endpoints (`/api/manage/system`)
- **Log** – automatic operation logging via AOP (`@OperationLog`)

### Caching, Rate Limiting & Scheduled Tasks

**Redis cache** (`RedisCacheConfig.java`, Spring Cache + Redis): caches high-traffic public read APIs. Cache regions are `CACHE_*` constants (`post`, `book`, `movie`, `footprint`, `photo`, `album`, `notice`, `comment`, `resource`). Default TTL 30 min; `comment` region 5 min. Key prefix is `cacheName:`. Values are JSON with `@class` type info (so `List<VO>` and MyBatis-Plus `Page<VO>` round-trip). A `CacheErrorHandler` makes cache failures non-fatal and self-healing (evicts bad keys, falls back to DB). Reference region constants from `RedisCacheConfig` in `@Cacheable`/`@CacheEvict` annotations.

**Login rate limiting** (`LoginRateLimiter.java`, `LoginRateLimitProperties`): Redis-backed, dual account-level + IP-level limits to block brute-force/enumeration. Configured under `blog.security.login-rate-limit` (enabled, max-attempts=3/account, ip-max-attempts=5/IP, window-seconds=300, lock-seconds=900). Redis keys: `login:fail:account:*`, `login:fail:ip:*`, `login:lock:*`.

**Post read count** (`PostServiceImpl.incrementReadCountAndGet` + `PostReadCountFlushTask`): because post detail is cached, reads increment a Redis counter `post:read:{id}` (INCR) instead of writing the DB each hit. A `@Scheduled` task (`@EnableScheduling` on `RedisCacheConfig`) flushes deltas to `read_num` every 5 min (5-min initial delay) and clears the `post` cache region to reload the baseline.

### Log Module (AOP + Async)

All `RestController` methods are automatically intercepted by `OperationLogAspect`.

**Flow**: `LogInterceptor` (collects IP/UA/URL into `LogContext` ThreadLocal) → Controller execution → `OperationLogAspect` (builds `Log` entity from result + context) → `AsyncLogTask.saveLog()` (async insert).

**`@OperationLog` annotation**: Mark on Controller methods for custom log type/level/action. If absent, action is inferred from Swagger `@Operation` summary or `ClassName.methodName`. Login/register URLs are treated as sensitive — request params are not logged.

### API Documentation
- Swagger UI: http://localhost:1001/swagger-ui.html
- OpenAPI JSON: http://localhost:1001/v3/api-docs

### Default Account
- Admin: `admin` / `123456`

## Frontend Architecture

The **public blog** (`seiko-blog-ui/`) is documented in detail below. The **admin panel** (`seiko-manage/`) mirrors the same API-layer pattern (`src/api/`, `src/utils/request.ts`) but is a client-rendered CRUD dashboard with route folders per module under `src/app/` (e.g. `posts/`, `posts/new`, `posts/edit`) and shared hooks `usePagedList` / `useEntityForm` / `useDebounce`.

### Routing (seiko-blog-ui, App Router, SSG)
- `/` – Home (Hero 70vh + two-column layout)
- `/blog` – Post list with pagination (`PAGE_SIZE = 8`)
- `/blog/[slug]` – Post detail (SSG via `generateStaticParams`)
- `/about`, `/footprint`, `/gallery`
- `/explore/music`, `/explore/book`, `/explore/movie`, `/explore/game`

### API Layer (`src/api/` + `src/utils/request.ts`)

All server components fetch data via the API layer at build time (SSG).

**`src/utils/request.ts`** – Axios instance with:
- Base URL from `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:1001/api`)
- Request interceptor: injects `Authorization` header from `localStorage.token`
- Response interceptor: unwraps `ApiResult.data`, maps error codes to messages, emits `unauthorized` event on 401/1002
- Helpers: `get<T>()`, `post<T>()`, `put<T>()`, `patch<T>()`, `del<T>()`, `getPage<T>()` (pagination)

**`src/api/types.ts`** – TypeScript interfaces mirroring backend VO/DTO:
- `ApiResult<T>` – backend wrapper
- `PageResult<T>` – MyBatis-Plus pagination
- `PostVO`, `FootprintVO`, `PhotoVO`, `CommentVO`, `NoticeVO`, `UserVO`, `LoginVO`, `BookVO`, `MovieVO`

**API modules** (`src/api/*.ts`): `post`, `footprint`, `photo`, `comment`, `notice`, `user`, `book`, `movie`

### Data Layer

**API-driven** (fetched at SSG build time from backend):
- Posts – `src/api/post.ts` → `getPostList()`, `getPostBySlug()`, `getAllTags()`
- Footprints – `src/api/footprint.ts` → `getFootprintList()`
- Photos – `src/api/photo.ts` → `getPhotoList()`
- Comments – `src/api/comment.ts` → `getCommentList()`
- Notices – `src/api/notice.ts` → `getEnabledNoticeList()`
- Books – `src/api/book.ts` → `getBookList()`
- Movies – `src/api/movie.ts` → `getMovieList()`

**Static TypeScript data** (no backend API):
- `games.ts` – explore page content only

### Key Constraints
- App Router `params` and `searchParams` are `Promise`, must `await`
- Header is `fixed`; `main` has `pt-14`; homepage uses `-mt-16` for full-screen Hero
- Wave images use `unoptimized` + `width: 200%` + `translateX(-50%)` for seamless CSS loop
- React Compiler is enabled – no manual `useMemo`/`useCallback` needed
- Custom animations defined in `globals.css` using `@theme inline`

## Configuration

- **Profiles**: `application.yml` selects the active profile (`spring.profiles.active`, default `dev`); per-env config in `application-dev.yml` / `application-prod.yml`.
- **File upload**: `blog.upload.path` (storage dir, e.g. `D:\blog\uploads` in dev) and `blog.upload.url-prefix` (default `/uploads`). Uploaded files are served statically and excluded from auth.
- **Login rate limit**: `blog.security.login-rate-limit.*` (see Caching/Rate Limiting section).

## Database

- Name: `seiko_blog`
- Charset: `utf8mb4`
- Init script: `sql/seiko_blog.sql`
