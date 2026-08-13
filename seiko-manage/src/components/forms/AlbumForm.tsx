"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createAlbum, getAlbumById, updateAlbum } from "@/api/photo";
import ImageUpload from "@/components/ImageUpload";
import FormScaffold from "@/components/FormScaffold";
import CalendarPicker from "@/components/CalendarPicker";
import { useEntityLoad } from "@/hooks/useEntityForm";
import { notifyError } from "@/utils/toast";
import type { AlbumCreateDTO, AlbumVO } from "@/types";

export default function AlbumForm({ mode }: { mode: "new" | "edit" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));

  const [albumName, setAlbumName] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");
  const [albumCover, setAlbumCover] = useState("");
  const [albumTime, setAlbumTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { loading, loadError } = useEntityLoad<AlbumVO>({
    enabled: mode === "edit",
    id,
    loader: getAlbumById,
    invalidIdMessage: "无效的相册 ID",
    loadFailMessage: "加载相册失败",
    onLoaded: (album) => {
      setAlbumName(album.albumName ?? "");
      setAlbumDesc(album.albumDesc ?? "");
      setAlbumCover(album.albumCover ?? "");
      setAlbumTime(album.albumTime ?? "");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!albumName.trim()) {
      notifyError("请填写相册名称");
      return;
    }
    const payload: AlbumCreateDTO = {
      albumName: albumName.trim(),
      albumDesc: albumDesc.trim() || undefined,
      albumCover: albumCover.trim() || undefined,
      albumTime: albumTime.trim() || undefined,
    };
    setSubmitting(true);
    try {
      if (mode === "new") await createAlbum(payload);
      else await updateAlbum(id, payload);
      router.push("/photos");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormScaffold
      title={mode === "new" ? "新建相册" : "编辑相册"}
      backHref="/photos"
      submitting={submitting}
      onSubmit={handleSubmit}
      loading={loading}
      loadError={loadError}
    >
      <div className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左侧：封面图 */}
          <div className="h-60">
            <ImageUpload label="封面图" value={albumCover} onChange={setAlbumCover} />
          </div>
          {/* 右侧：相册名称、相册时间 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">相册名称 *</label>
              <input
                type="text"
                className="input"
                placeholder="如：夏日海边"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
              />
            </div>
            <CalendarPicker
              label="相册时间"
              precision="second"
              placeholder="请选择相册时间"
              value={albumTime}
              onChange={setAlbumTime}
            />
          </div>
        </div>
        {/* 底部：简介描述 */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">简介描述</label>
          <textarea
            className="input min-h-20 resize-y"
            placeholder="记录这个相册的故事..."
            value={albumDesc}
            onChange={(e) => setAlbumDesc(e.target.value)}
          />
        </div>
      </div>
    </FormScaffold>
  );
}
