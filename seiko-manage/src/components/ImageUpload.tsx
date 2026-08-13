"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { ImageUp, Loader2, X } from "lucide-react";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  convertToPixelCrop,
  cropToCanvas,
  makeAspectCrop,
} from "react-image-crop";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  uploadImage,
} from "@/api/upload";
import { ApiBusinessError } from "@/utils/request";

interface ImageUploadProps {
  /** 当前图片 URL（受控） */
  value?: string;
  /** 上传成功或清除时回调，返回新的图片 URL（清除时为空字符串） */
  onChange?: (url: string) => void;
  /** 字段标签 */
  label?: string;
  /** 占位提示文案 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 外层容器额外类名 */
  className?: string;
  /**
   * 预览/上传框的固定宽高比（CSS aspect-ratio 值，如 "16/9"、"3/4"、"1"）。
   * 传入后预览框尺寸由该比例决定，不再随图片自身比例变化，避免布局紊乱。
   * 不传则填满父容器（需父容器提供确定高度，如 aspect-* / h-*）。
   *
   * 该比例同时会作为裁剪框的固定宽高比；不传则允许自由裁剪。
   */
  aspectRatio?: string;
}

function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(0)}MB`;
}

/** 将 CSS aspect-ratio 字符串（如 "16/9"）解析为数字 */
function parseAspectRatio(value?: string): number | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  const slashIndex = trimmed.indexOf("/");
  if (slashIndex !== -1) {
    const a = Number(trimmed.slice(0, slashIndex));
    const b = Number(trimmed.slice(slashIndex + 1));
    if (!Number.isNaN(a) && !Number.isNaN(b) && b !== 0) {
      return a / b;
    }
  }
  const n = Number(trimmed);
  return Number.isNaN(n) ? undefined : n;
}

/** 生成居中、占屏 90% 的固定比例裁剪区 */
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageUpload({
  value,
  onChange,
  label,
  placeholder = "点击或拖拽图片到此处上传",
  disabled = false,
  className = "",
  aspectRatio,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string>("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [cropping, setCropping] = useState(false);

  const aspect = parseAspectRatio(aspectRatio);

  const setPreviewUrl = useCallback((url: string | null) => {
    if (previewUrlRef.current && previewUrlRef.current !== url) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = url;
    setImgSrc(url ?? "");
  }, []);

  const closeCropModal = useCallback(() => {
    setCropModalOpen(false);
    setPendingFile(null);
    setCrop(undefined);
    setCompletedCrop(null);
    setCropping(false);
    setPreviewUrl(null);
  }, [setPreviewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!cropModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCropModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cropModalOpen, closeCropModal]);

  const validate = (file: File): string => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "仅支持 JPG / PNG / WebP / GIF 格式";
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `图片大小不能超过 ${formatSize(MAX_IMAGE_SIZE)}`;
    }
    return "";
  };

  const doUpload = async (file: File) => {
    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadImage(file, setProgress);
      onChange?.(result.url);
    } catch (e) {
      const message =
        e instanceof ApiBusinessError ? e.message : "上传失败，请重试";
      setError(message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFile = async (file: File) => {
    setError("");
    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // GIF 保留动画，直接上传，不裁剪
    if (file.type === "image/gif") {
      await doUpload(file);
      return;
    }

    setPendingFile(file);
    setCompletedCrop(null);
    setPreviewUrl(URL.createObjectURL(file));
    setCropModalOpen(true);
  };

  const onImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    if (aspect) {
      setCrop(centerAspectCrop(width, height, aspect));
    } else {
      setCrop({ unit: "%", x: 5, y: 5, width: 90, height: 90 });
    }
  };

  const handleConfirmCrop = async () => {
    const image = imgRef.current;
    if (!image || !pendingFile) return;

    const pixelCrop =
      completedCrop ??
      (crop
        ? convertToPixelCrop(crop, image.width, image.height)
        : null);

    if (!pixelCrop || pixelCrop.width <= 0 || pixelCrop.height <= 0) {
      setError("请选择有效的裁剪区域");
      return;
    }

    setCropping(true);
    try {
      const canvas = document.createElement("canvas");
      await cropToCanvas(image, canvas, pixelCrop);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, pendingFile.type, 0.92);
      });
      if (!blob) {
        throw new Error("裁剪图片失败");
      }

      const ext =
        blob.type === "image/png"
          ? "png"
          : blob.type === "image/webp"
          ? "webp"
          : "jpg";
      const croppedName =
        pendingFile.name.replace(/\.[^.]+$/, "") + `.${ext}`;
      const croppedFile = new File([blob], croppedName, {
        type: blob.type,
        lastModified: Date.now(),
      });

      closeCropModal();
      await doUpload(croppedFile);
    } catch (e) {
      const message = e instanceof Error ? e.message : "裁剪失败";
      setError(message);
      setCropping(false);
    }
  };

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // 允许再次选择同一文件
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    onChange?.("");
    setError("");
  };

  const openPicker = () => {
    if (!disabled && !uploading) inputRef.current?.click();
  };

  // 固定比例时由 aspect-ratio 决定尺寸；否则填满父容器
  const boxSizing = aspectRatio ? "w-full" : "flex-1 w-full";
  const boxStyle = aspectRatio ? { aspectRatio } : undefined;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={onSelect}
        disabled={disabled}
      />

      {value && !uploading ? (
        // 预览态
        <div
          className={`relative group rounded-lg border border-border bg-black ${boxSizing}`}
          style={boxStyle}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="已上传图片"
            className="absolute inset-0 w-full h-full object-contain rounded-lg"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600 transition-colors"
              aria-label="移除图片"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        // 上传态 / 空态
        <div
          onClick={openPicker}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled && !uploading) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          style={boxStyle}
          className={[
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors px-4 text-center",
            boxSizing,
            disabled || uploading
              ? "cursor-not-allowed opacity-70"
              : "cursor-pointer hover:border-primary",
            dragOver ? "border-primary bg-primary/5" : "border-border",
          ].join(" ")}
        >
          {uploading ? (
            <>
              <Loader2 size={28} className="text-primary animate-spin" />
              <div className="w-2/3 max-w-xs h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">上传中 {progress}%</span>
            </>
          ) : (
            <>
              <ImageUp size={28} className="text-gray-400" />
              <span className="text-sm text-gray-500">{placeholder}</span>
              <span className="text-xs text-gray-400">
                支持 JPG / PNG / WebP / GIF，最大 {formatSize(MAX_IMAGE_SIZE)}
              </span>
            </>
          )}
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}

      {cropModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => {
              if (!cropping) closeCropModal();
            }}
          />
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl bg-card-bg p-5 shadow-xl animate-dialog-in">
            <h3 className="text-base font-semibold text-foreground mb-3">
              裁剪图片
            </h3>

            <div className="flex-1 overflow-auto flex items-center justify-center rounded-lg bg-black/5">
              {imgSrc && (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  className="max-h-[60vh]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={imgSrc}
                    alt="待裁剪图片"
                    className="max-h-[60vh] w-auto object-contain"
                    onLoad={onImageLoaded}
                  />
                </ReactCrop>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeCropModal}
                disabled={cropping}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-primary inline-flex items-center gap-2"
                onClick={handleConfirmCrop}
                disabled={cropping || !crop}
              >
                {cropping && <Loader2 size={16} className="animate-spin" />}
                {cropping ? "处理中" : "确认裁剪"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
