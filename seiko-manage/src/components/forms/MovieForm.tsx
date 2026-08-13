"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createMovie, getMovieById, updateMovie } from "@/api/movie";
import ImageUpload from "@/components/ImageUpload";
import FormScaffold from "@/components/FormScaffold";
import { useEntityLoad } from "@/hooks/useEntityForm";
import { notifyError } from "@/utils/toast";
import type { MovieDTO, MovieVO } from "@/types";

export default function MovieForm({ mode }: { mode: "new" | "edit" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));

  const [movieName, setMovieName] = useState("");
  const [rating, setRating] = useState("");
  const [ratingSource, setRatingSource] = useState("豆瓣");
  const [tags, setTags] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [backdrop, setBackdrop] = useState("");
  const [duration, setDuration] = useState("");
  const [isTop, setIsTop] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const { loading, loadError } = useEntityLoad<MovieVO>({
    enabled: mode === "edit",
    id,
    loader: getMovieById,
    invalidIdMessage: "无效的电影 ID",
    loadFailMessage: "加载电影失败",
    onLoaded: (movie) => {
      setMovieName(movie.movieName ?? "");
      setRating(movie.rating != null ? String(movie.rating) : "");
      setRatingSource(movie.ratingSource ?? "豆瓣");
      setTags(movie.tags ?? "");
      setSynopsis(movie.synopsis ?? "");
      setBackdrop(movie.backdrop ?? "");
      setDuration(movie.duration != null ? String(movie.duration) : "");
      setIsTop(movie.isTop ?? 0);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!movieName.trim()) {
      notifyError("请填写电影名称");
      return;
    }
    const ratingNum = parseFloat(rating);
    if (Number.isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
      notifyError("评分需在 0~10 之间");
      return;
    }
    const payload: MovieDTO = {
      movieName: movieName.trim(),
      rating: ratingNum,
      isTop,
      ratingSource: ratingSource.trim() || undefined,
      tags: tags.trim() || undefined,
      synopsis: synopsis.trim() || undefined,
      backdrop: backdrop.trim() || undefined,
      duration: duration.trim() ? parseInt(duration.trim(), 10) : null,
    };
    setSubmitting(true);
    try {
      if (mode === "new") await createMovie(payload);
      else await updateMovie(id, payload);
      router.push("/movies");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormScaffold
      title={mode === "new" ? "添加电影" : "编辑电影"}
      backHref="/movies"
      submitting={submitting}
      onSubmit={handleSubmit}
      loading={loading}
      loadError={loadError}
    >
      <div className="card space-y-4">
        <div className="flex gap-4">
          <div className="w-96 shrink-0">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">背景大图</label>
            <div className="aspect-video">
              <ImageUpload value={backdrop} onChange={setBackdrop} placeholder="上传背景图" />
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">电影名称 *</label>
              <input
                type="text"
                className="input"
                placeholder="如：星际穿越"
                value={movieName}
                onChange={(e) => setMovieName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">评分 *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  className="input"
                  placeholder="如：9.3"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">评分来源</label>
                <input
                  type="text"
                  className="input"
                  placeholder="如：豆瓣"
                  value={ratingSource}
                  onChange={(e) => setRatingSource(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">标签</label>
                <input
                  type="text"
                  className="input"
                  placeholder="科幻,冒险（逗号分隔）"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">时长（分钟）</label>
                <input
                  type="number"
                  className="input"
                  placeholder="如：169"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">剧情简介</label>
          <textarea
            className="input min-h-24 resize-y"
            placeholder="电影的剧情简介..."
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isTop"
            type="checkbox"
            className="rounded border-gray-300"
            checked={isTop === 1}
            onChange={(e) => setIsTop(e.target.checked ? 1 : 0)}
          />
          <label htmlFor="isTop" className="text-sm text-gray-600">置顶展示</label>
        </div>
      </div>
    </FormScaffold>
  );
}
