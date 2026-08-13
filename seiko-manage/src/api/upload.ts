import { request } from "@/utils/request";
import type { UploadVO } from "@/types";

/** 允许上传的图片 MIME 类型（与后端 blog.upload.allowed-types 保持一致） */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/** 单个文件最大限制，单位字节（与后端 blog.upload.max-size 保持一致，默认 10MB） */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/**
 * 上传图片
 *
 * @param file 图片文件
 * @param onProgress 上传进度回调（0-100）
 * @returns 上传结果，包含可访问的完整 URL
 */
export async function uploadImage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadVO> {
  const formData = new FormData();
  formData.append("file", file);

  return request<UploadVO>({
    method: "POST",
    url: "/manage/upload/image",
    data: formData,
    // 必须显式覆盖实例默认的 application/json：
    // 否则 axios 会把 FormData 序列化为 JSON 导致文件丢失。
    // 设为 multipart/form-data 后，axios 浏览器适配器会自动补上 boundary。
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });
}
