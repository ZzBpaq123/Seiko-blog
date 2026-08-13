/**
 * 前端 TypeScript 接口
 * 与后端 VO/DTO 一一对应
 */

// ─── 通用 ───

/**
 * 后端 API 统一响应结构
 * 对应 com.seiko.blog.common.Result<T>
 */
export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * MyBatis-Plus 分页结构
 * 对应 com.baomidou.mybatisplus.extension.plugins.pagination.Page<T>
 */
export interface PageResult<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
  pages: number;
}

/**
 * 分页请求参数
 */
export interface PageParams {
  page?: number;
  size?: number;
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
}

export interface TagCount {
  tag: string;
  count: number;
}

// ─── Notice ───

export interface NoticeVO {
  id: number;
  noticeTitle: string;
  noticeContent: string;
  noticeImage: string;
  noticeLink: string;
  bgColor: string;
  sortOrder: number;
  enabled: boolean;
  createTime: string;
}

export interface NoticeDTO {
  noticeTitle: string;
  noticeContent?: string;
  noticeImage?: string;
  noticeLink?: string;
  bgColor?: string;
  sortOrder?: number;
  enabled?: boolean;
}

// ─── Comment ───

export interface CommentVO {
  id: number;
  userEmail: string;
  author: string;
  commentContent: string;
  commentDate: string;
  avatarColor?: string;
  postId?: number;
  createTime: string;
}

export interface CommentDTO {
  userEmail: string;
  code: string;
  author: string;
  commentContent: string;
  commentDate: string;
  avatarColor?: string;
  postId?: number;
}

export interface EmailCodeSendDTO {
  email: string;
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

export interface PhotoDTO {
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

export interface FootprintDTO {
  city: string;
  province?: string;
  country: string;
  countryCode: string;
  footprintDate: string;
  description?: string;
  image?: string;
  footprintType: string;
  lat?: number;
  lng?: number;
}
