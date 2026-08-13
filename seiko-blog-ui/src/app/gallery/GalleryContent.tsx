"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import StarField from "@/components/gallery/StarField";
import MeteorShower from "@/components/gallery/MeteorShower";
import GalleryEntrance from "@/components/gallery/GalleryEntrance";
import { getPhotosByAlbumId } from "@/api/photo";
import type { AlbumVO, PhotoVO } from "@/api/types";

type Phase = "warp" | "starry" | "album-info" | "transition" | "photos";

interface StarPosition {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

interface GalleryContentClientProps {
  initialAlbums: AlbumVO[];
}

export default function GalleryContent({
  initialAlbums,
}: GalleryContentClientProps) {
  const [phase, setPhase] = useState<Phase>("warp");
  const [albums] = useState<AlbumVO[]>(initialAlbums);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumVO | null>(null);
  const [photos, setPhotos] = useState<PhotoVO[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  /* ─── 生成星星位置（带最小间距） ─── */
  const clickableStars = useMemo<StarPosition[]>(() => {
    const seedRandom = (seed: number) => {
      let s = seed;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    };
    const rand = seedRandom(42);
    const count = albums.length;
    const stars: StarPosition[] = [];
    const minDistance = 12; // 最小百分比间距

    for (let i = 0; i < count; i++) {
      let x: number, y: number;
      let attempts = 0;
      do {
        x = 12 + rand() * 76;
        y = 18 + rand() * 62;
        attempts++;
      } while (
        attempts < 50 &&
        stars.some((s) => Math.hypot(s.x - x, s.y - y) < minDistance)
      );
      stars.push({
        id: i,
        x,
        y,
        size: 3 + rand() * 3,
        delay: rand() * 3,
      });
    }
    return stars;
  }, [albums.length]);

  const handleEntranceDone = useCallback(() => {
    setPhase("starry");
  }, []);

  /* ─── 点击星星 ─── */
  const handleStarClick = useCallback(
    (index: number) => {
      if (phase !== "starry") return;
      const album = albums[index];
      if (!album) return;
      setSelectedAlbum(album);
      setPhase("album-info");
    },
    [phase, albums],
  );

  /* ─── 返回 ─── */
  const handleBack = useCallback(() => {
    setSelectedAlbum(null);
    setPhotos([]);
    setPhase("starry");
  }, []);

  /* ─── 进入相册 ─── */
  const handleEnter = useCallback(async () => {
    if (!selectedAlbum) return;
    setPhase("transition");
    setLoadingPhotos(true);

    try {
      const data = await getPhotosByAlbumId(selectedAlbum.id);
      setPhotos(data);
    } catch {
      setPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }

    setTimeout(() => setPhase("photos"), 1500);
  }, [selectedAlbum]);

  const showStarryContent =
    phase === "starry" || phase === "album-info" || phase === "transition";
  const showPhotos = phase === "photos";

  return (
    <GalleryEntrance onDone={handleEntranceDone}>
      {/* 星空背景 */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          showPhotos ? "opacity-20" : "opacity-100"
        }`}
      >
        <StarField className="absolute inset-0 pointer-events-none" />
      </div>

      {/* 流星 - starry / album-info 阶段 */}
      {(phase === "starry" || phase === "album-info") && (
        <MeteorShower
          className="absolute inset-0 z-1"
          maxMeteors={4}
          spawnRate={0.012}
        />
      )}

      {/* 导航栏 */}
      <div className="relative z-50">
        <Header overlayMode />
      </div>

      {/* 中央浮现文字 - transition 时淡出 */}
      {showStarryContent && (
        <div
          className={`absolute inset-0 z-5 flex items-center justify-center pointer-events-none transition-all duration-1000 ease-out ${
            phase === "transition"
              ? "opacity-0 -translate-y-8 scale-95"
              : "opacity-100 translate-y-0 scale-100"
          }`}
        >
          <p className="text-center text-2xl font-light tracking-[0.3em] text-white/90">
            每一颗星星都是一段回忆
          </p>
        </div>
      )}

      {/* 可点击星星 */}
      {showStarryContent && (
        <div
          className={`absolute inset-0 z-6 transition-opacity duration-1000 ${
            phase === "transition" ? "opacity-0" : "opacity-100"
          }`}
        >
          {albums.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-white/40 text-sm tracking-wider">
                暂无相册，星空还在等待第一个故事
              </p>
            </div>
          )}

          {clickableStars.map((star, index) => {
            const album = albums[index];
            const isSelected = selectedAlbum?.id === album?.id;
            const isOther = selectedAlbum !== null && !isSelected;

            return (
              <button
                key={star.id}
                onClick={() => handleStarClick(index)}
                disabled={phase !== "starry"}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center
                  rounded-full cursor-pointer group transition-all duration-1000 ${
                    isOther && phase === "transition"
                      ? "opacity-0 scale-50"
                      : "opacity-100 scale-100"
                  }`}
                style={{ left: `${star.x}%`, top: `${star.y}%` }}
                aria-label={`查看相册：${album?.albumName || ""}`}
              >
                {/* hover 热区背景 */}
                <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/3 transition-colors duration-300" />

                {/* 星星核心 */}
                <span
                  className={`
                    relative block rounded-full bg-white transition-all duration-300
                    shadow-[0_0_12px_3px_rgba(255,255,255,0.6)]
                    group-hover:shadow-[0_0_24px_8px_rgba(255,255,255,0.9)]
                    group-hover:scale-150
                    ${isSelected ? "animate-star-flash" : "animate-pulse"}
                  `}
                  style={{
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    animationDelay: isSelected ? "0s" : `${star.delay}s`,
                    animationDuration: isSelected ? "0.4s" : "2s",
                  }}
                />
                {/* 外圈光晕 */}
                <span
                  className="absolute -inset-2 rounded-full bg-white/5 animate-ping pointer-events-none"
                  style={{
                    animationDuration: "4s",
                    animationDelay: `${star.delay}s`,
                  }}
                />
                {/* hover 提示环 */}
                <span className="absolute -inset-3 rounded-full border border-white/0 group-hover:border-white/20 transition-colors duration-300 pointer-events-none" />
              </button>
            );
          })}
        </div>
      )}

      {/* 相册信息框 */}
      {phase === "album-info" && selectedAlbum && (
        <div className="absolute inset-0 z-20 flex items-center justify-center animate-content-fade-in">
          <div className="relative max-w-md w-full mx-4 p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
            {/* 相册封面 */}
            {selectedAlbum.albumCover && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4">
                <Image
                  src={selectedAlbum.albumCover}
                  alt={selectedAlbum.albumName}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* 相册名称 */}
            <h3 className="text-xl font-light text-white text-center tracking-wider mb-2">
              {selectedAlbum.albumName}
            </h3>

            {/* 相册描述 */}
            {selectedAlbum.albumDesc && (
              <p className="text-white/60 text-sm text-center mb-6 leading-relaxed">
                {selectedAlbum.albumDesc}
              </p>
            )}

            {/* 按钮组 */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleBack}
                className="px-6 py-2 rounded-full border border-white/20 text-white/80 text-sm
                  hover:bg-white/10 hover:text-white transition-all duration-300"
              >
                返回
              </button>
              <button
                onClick={handleEnter}
                className="px-6 py-2 rounded-full bg-white/90 text-black text-sm font-medium
                  hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300"
              >
                进入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 照片列表 */}
      {showPhotos && (
        <div className="absolute inset-0 z-10 overflow-y-auto animate-content-fade-in">
          <div className="min-h-screen pt-20 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
              {/* 返回按钮 */}
              <button
                onClick={handleBack}
                className="mb-6 flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                返回星空
              </button>

              <h2 className="text-3xl font-light text-white text-center mb-3 tracking-[0.2em]">
                {selectedAlbum?.albumName}
              </h2>
              <p className="text-white/40 text-center mb-12 text-sm tracking-wider">
                {photos.length} 张照片
              </p>

              {loadingPhotos ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              ) : photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {photos.map((photo, i) => (
                    <div
                      key={photo.id}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm animate-fade-in-up"
                      style={{ animationDelay: `${Math.min(i * 80, 1200)}ms` }}
                    >
                      <Image
                        src={photo.photoSrc}
                        alt={photo.photoAlt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <div
                        className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                          <p className="text-white text-sm font-medium truncate">
                            {photo.photoTitle || photo.photoAlt}
                          </p>
                          {photo.photoLocation && (
                            <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              {photo.photoLocation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-white/40 py-20">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-white/20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-lg">暂无照片</p>
                  <p className="text-sm mt-2 text-white/25">
                    这个相册还没有照片
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 底部占位 */}
      {!showPhotos && (
        <div className="relative z-10 h-[calc(100vh-3.5rem)] pointer-events-none" />
      )}
    </GalleryEntrance>
  );
}
