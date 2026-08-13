"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createPhoto, getAlbumList, getPhotoById, updatePhoto } from "@/api/photo";
import ImageUpload from "@/components/ImageUpload";
import Select from "@/components/Select";
import FormScaffold from "@/components/FormScaffold";
import CalendarPicker from "@/components/CalendarPicker";
import { useEntityLoad } from "@/hooks/useEntityForm";
import { notifyError } from "@/utils/toast";
import type { AlbumVO, PhotoCreateDTO, PhotoVO } from "@/types";

export default function PhotoForm({ mode }: { mode: "new" | "edit" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));
  const defaultAlbumId = searchParams.get("albumId");
  const isEdit = mode === "edit";

  const [albums, setAlbums] = useState<AlbumVO[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(true);

  const [albumId, setAlbumId] = useState<number | "">(
    !isEdit && defaultAlbumId ? Number(defaultAlbumId) : ""
  );
  const [photoSrc, setPhotoSrc] = useState("");
  const [photoAlt, setPhotoAlt] = useState("");
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoWidth, setPhotoWidth] = useState("");
  const [photoHeight, setPhotoHeight] = useState("");
  const [photoLocation, setPhotoLocation] = useState("");
  const [photoDate, setPhotoDate] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  // 加载相册列表用于下拉选择
  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        setAlbumsLoading(true);
        return getAlbumList({ page: 1, size: 100 });
      })
      .then((res) => {
        if (cancelled) return;
        const list = res?.records ?? [];
        setAlbums(list);
        // 新建且未指定默认相册时选中第一个
        if (!isEdit) {
          setAlbumId((prev) => (prev === "" && list.length > 0 ? list[0].id : prev));
        }
      })
      .catch(() => {
        if (!cancelled) setAlbums([]);
      })
      .finally(() => {
        if (!cancelled) setAlbumsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isEdit]);

  const { loading: photoLoading, loadError } = useEntityLoad<PhotoVO>({
    enabled: isEdit,
    id,
    loader: getPhotoById,
    invalidIdMessage: "无效的照片 ID",
    loadFailMessage: "加载照片失败",
    onLoaded: (photo) => {
      setAlbumId(photo.albumId ?? "");
      setPhotoSrc(photo.photoSrc ?? "");
      setPhotoAlt(photo.photoAlt ?? "");
      setPhotoTitle(photo.photoTitle ?? "");
      setPhotoWidth(photo.photoWidth ? String(photo.photoWidth) : "");
      setPhotoHeight(photo.photoHeight ? String(photo.photoHeight) : "");
      setPhotoLocation(photo.photoLocation ?? "");
      setPhotoDate(photo.photoDate ?? "");
      setSortOrder(photo.sortOrder != null ? String(photo.sortOrder) : "0");
    },
  });

  // 上传图片后自动探测宽高
  const handleImageChange = (url: string) => {
    setPhotoSrc(url);
    if (!url) return;
    const img = new window.Image();
    img.onload = () => {
      setPhotoWidth(String(img.naturalWidth));
      setPhotoHeight(String(img.naturalHeight));
    };
    img.src = url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (albumId === "") {
      notifyError("请选择所属相册");
      return;
    }
    if (!photoSrc.trim()) {
      notifyError("请上传图片");
      return;
    }
    if (!photoAlt.trim()) {
      notifyError("请填写图片替代文本");
      return;
    }
    const width = Number(photoWidth);
    const height = Number(photoHeight);
    if (!width || width <= 0 || !height || height <= 0) {
      notifyError("图片宽高必须为正数");
      return;
    }
    const payload: PhotoCreateDTO = {
      albumId: Number(albumId),
      photoSrc: photoSrc.trim(),
      photoAlt: photoAlt.trim(),
      photoWidth: width,
      photoHeight: height,
      photoTitle: photoTitle.trim() || undefined,
      photoLocation: photoLocation.trim() || undefined,
      photoDate: photoDate || undefined,
      sortOrder: sortOrder.trim() ? Number(sortOrder) : 0,
    };
    setSubmitting(true);
    try {
      if (isEdit) await updatePhoto(id, payload);
      else await createPhoto(payload);
      router.push("/photos");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormScaffold
      title={isEdit ? "编辑照片" : "上传照片"}
      backHref="/photos"
      submitting={submitting}
      onSubmit={handleSubmit}
      loading={isEdit ? photoLoading || albumsLoading : false}
      loadError={loadError}
    >
      {!albumsLoading && albums.length === 0 && (
        <div className="card border-amber-200 bg-amber-50 text-amber-700 text-sm py-3">
          暂无相册，请先到相册管理创建相册后再上传照片。
        </div>
      )}

      <div className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 h-64">
            <ImageUpload label="图片 *" value={photoSrc} onChange={handleImageChange} />
          </div>
          <div className="md:col-span-3 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">所属相册 *</label>
              <Select
                value={albumId}
                onChange={(v) => setAlbumId(v === "" ? "" : Number(v))}
                placeholder="请选择相册"
                options={[
                  { value: "", label: "请选择相册" },
                  ...albums.map((a) => ({ value: a.id, label: a.albumName })),
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">标题</label>
              <input
                type="text"
                className="input"
                placeholder="如：海边落日"
                value={photoTitle}
                onChange={(e) => setPhotoTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">替代文本 *</label>
              <input
                type="text"
                className="input"
                placeholder="图片描述，用于无障碍与 SEO"
                value={photoAlt}
                onChange={(e) => setPhotoAlt(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">宽度(px) *</label>
            <input
              type="number"
              className="input"
              value={photoWidth}
              onChange={(e) => setPhotoWidth(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">高度(px) *</label>
            <input
              type="number"
              className="input"
              value={photoHeight}
              onChange={(e) => setPhotoHeight(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">排序</label>
            <input
              type="number"
              className="input"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
          <CalendarPicker
            label="拍摄日期"
            precision="day"
            placeholder="请选择拍摄日期"
            value={photoDate}
            onChange={setPhotoDate}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">拍摄地点</label>
          <input
            type="text"
            className="input"
            placeholder="如：三亚"
            value={photoLocation}
            onChange={(e) => setPhotoLocation(e.target.value)}
          />
        </div>
      </div>
    </FormScaffold>
  );
}
