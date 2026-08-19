/**
 * 前端 TypeScript 接口
 * 与后端 VO/DTO 一一对应
 */

// ─── 通用 ───

export interface ApiResult<T> {
  code: number;
  message: string;
  /** 部分后端响应使用 msg 字段，作为 message 的兼容回退 */
  msg?: string;
  data: T;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
  pages: number;
}

export interface PageParams {
  page?: number;
  size?: number;
}

// ─── Stats ───

/** 后台数据统计概览，对应后端 StatsVO */
export interface StatsVO {
  /** 文章总数（已发布） */
  postCount: number;
  /** 评论总数 */
  commentCount: number;
  /** 相册总数 */
  albumCount: number;
  /** 照片总数 */
  photoCount: number;
  /** 文章总阅读量 */
  totalReadNum: number;
}

/** 阅读量趋势项，对应后端 ReadTrendVO */
export interface ReadTrendVO {
  /** 日期，格式 yyyy-MM-dd */
  date: string;
  /** 当日阅读次数 */
  count: number;
}

/** 内容新建趋势项，对应后端 CreationTrendVO */
export interface CreationTrendVO {
  /** 日期，格式 yyyy-MM-dd */
  date: string;
  /** 当日新建文章数量 */
  postCount: number;
  /** 当日新建相册数量 */
  albumCount: number;
  /** 当日新增照片数量 */
  photoCount: number;
}

// ─── User ───

export interface LoginVO {
  token: string;
  tokenType: string;
  user: UserVO;
}

export interface UserVO {
  id: number;
  username: string;
  nickname: string;
  email: string;
  avatar: string;
  avatarColor: string;
  bio: string;
  website: string;
  userRole: string;
  userStatus: string;
  lastLoginTime: string;
  createTime: string;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface RegisterDTO {
  username: string;
  password: string;
  nickname: string;
  email?: string;
}

/** 后台创建/编辑用户请求体，对应后端 UserDTO */
export interface UserDTO {
  username: string;
  /** 创建时必填；编辑时留空表示不修改 */
  password?: string;
  nickname: string;
  email?: string;
  avatar?: string;
  avatarColor?: string;
  bio?: string;
  website?: string;
  userRole?: string;
  userStatus?: string;
}

// ─── Post ───

export interface PostVO {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
  readNum: number;
  cover?: string;
  published?: boolean;
}

export interface TagCount {
  tag: string;
  count: number;
}

/** 标签，对应后端 TagVO */
export interface TagVO {
  id: number;
  name: string;
  slug: string;
}

/** 新建/编辑标签请求体，对应后端 TagDTO */
export interface TagDTO {
  name: string;
  slug?: string;
}

/** 新建/编辑文章请求体，对应 seiko_posts 表 */
export interface PostCreateDTO {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover?: string;
  author?: string;
  tags?: string[];
  published?: boolean;
}

// ─── Notice ───

export interface NoticeVO {
  id: number;
  noticeTitle: string;
  noticeContent: string;
  noticeImage: string;
  noticeLink: string;
  sortOrder: number;
  enabled: boolean;
  createTime: string;
}

export interface NoticeDTO {
  noticeTitle: string;
  noticeContent?: string;
  noticeImage?: string;
  noticeLink?: string;
  sortOrder?: number;
  enabled?: boolean;
}

// ─── Resource ───

export interface ResourceVO {
  id: number;
  resourceName: string;
  resourceUrl: string;
  category: string;
  description: string;
  sortOrder: number;
  enabled: boolean;
  createTime: string;
}

export interface ResourceDTO {
  resourceName: string;
  resourceUrl: string;
  category?: string;
  description?: string;
  sortOrder?: number;
  enabled?: boolean;
}

// ─── Comment ───

/** 评论 VO，对应后端 CommentVO */
export interface CommentVO {
  id: number;
  userEmail: string;
  author: string;
  commentContent: string;
  commentDate: string;
  avatarColor: string;
  postId?: number;
  createTime: string;
}

/** 评论创建请求，对应后端 CommentDTO */
export interface CommentDTO {
  userEmail: string;
  code: string;
  author: string;
  commentContent: string;
  commentDate: string;
  avatarColor?: string;
  postId?: number;
}

// ─── Photo / Album ───

export interface AlbumVO {
  id: number;
  albumName: string;
  albumDesc: string;
  albumCover: string;
  albumTime: string;
  createTime: string;
}

export interface PhotoVO {
  id: number;
  albumId: number;
  photoSrc: string;
  photoAlt: string;
  photoWidth: number;
  photoHeight: number;
  photoTitle: string;
  photoLocation: string;
  photoDate: string;
  sortOrder: number;
  createTime: string;
}

/** 新建/编辑相册请求体 */
export interface AlbumCreateDTO {
  albumName: string;
  albumDesc?: string;
  albumCover?: string;
  albumTime?: string;
}

/** 新建/编辑照片请求体 */
export interface PhotoCreateDTO {
  albumId: number;
  photoSrc: string;
  photoAlt: string;
  photoWidth: number;
  photoHeight: number;
  photoTitle?: string;
  photoLocation?: string;
  photoDate?: string;
  sortOrder?: number;
}

// ─── Book ───

export interface BookVO {
  id: number;
  bookName: string;
  bookAuthor: string;
  bookCover: string;
  description: string;
}

export interface BookDTO {
  bookName: string;
  bookAuthor?: string;
  bookCover?: string;
  description?: string;
}

// ─── Movie ───

export interface MovieVO {
  id: number;
  movieName: string;
  isTop: number;
  rating: number;
  ratingSource: string;
  tags: string;
  synopsis: string;
  backdrop: string;
  duration: number | null;
}

export interface MovieDTO {
  movieName: string;
  isTop: number;
  rating: number;
  ratingSource?: string;
  tags?: string;
  synopsis?: string;
  backdrop?: string;
  duration?: number | null;
}

// ─── Upload ───

export interface UploadVO {
  /** 文件访问 URL */
  url: string;
  /** 原始文件名 */
  originalName: string;
  /** 文件大小，单位字节 */
  size: number;
}

// ─── Footprint ───

export interface FootprintVO {
  id: number;
  city: string;
  province: string;
  country: string;
  countryCode: string;
  footprintDate: string;
  description: string;
  image: string;
  footprintType: string;
  lat: number;
  lng: number;
  createTime: string;
}

/** 新建/编辑足迹请求体 */
export interface FootprintCreateDTO {
  city: string;
  province: string;
  country: string;
  countryCode: string;
  footprintDate: string;
  description?: string;
  image?: string;
  footprintType: string;
  lat?: number;
  lng?: number;
}

// ─── Log ───

/** 日志 VO，对应后端 LogVO */
export interface LogVO {
  id: number;
  /** 日志类型: operation-操作日志, login-登录日志, error-错误日志, security-安全日志 */
  logType: string;
  /** 日志级别: DEBUG-调试, INFO-信息, WARN-警告, ERROR-错误 */
  logLevel: string;
  /** 操作动作 */
  action: string;
  /** 操作描述 */
  description?: string;
  /** 操作用户ID */
  userId?: number;
  /** 操作用户名 */
  username?: string;
  /** IP地址 */
  ipAddress?: string;
  /** 用户代理 */
  userAgent?: string;
  /** 请求方法 */
  requestMethod?: string;
  /** 方法名称（类全限定名.方法名） */
  method?: string;
  /** 请求URL */
  requestUrl?: string;
  /** 请求参数(JSON) */
  requestParams?: string;
  /** 返回参数(JSON) */
  jsonResult?: string;
  /** 响应状态码 */
  responseCode?: number;
  /** 操作状态: 0-正常 1-异常 */
  status?: number;
  /** 消耗时间(毫秒) */
  costTime?: number;
  /** 错误信息 */
  errorMessage?: string;
  /** 创建时间，格式 yyyy-MM-dd HH:mm:ss */
  createTime: string;
}
