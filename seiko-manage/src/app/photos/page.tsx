"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ImageIcon,
  Folder,
  RotateCcw,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import {
  getAlbumList,
  deleteAlbum,
  getPhotoList,
  deletePhoto,
} from "@/api/photo";
import type { AlbumVO, PageResult, PhotoVO } from "@/types";
import { useConfirm } from "@/components/ConfirmDialog";
import Select from "@/components/Select";
import Pagination from "@/components/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagedList } from "@/hooks/usePagedList";
import { notifyError, notifySuccess } from "@/utils/toast";
import { toDateOnly } from "@/utils/date";

const PAGE_SIZE = 10;

const emptyPhotoPage: PageResult<PhotoVO> = {
  records: [],
  total: 0,
  current: 1,
  size: PAGE_SIZE,
  pages: 0,
};

export default function PhotosPage() {
  const router = useRouter();
  const confirm = useConfirm();

  const [view, setView] = useState<"album" | "photo">("album");

  // ─── 相册列表状态（一次性加载，供下拉与网格展示） ───
  const [albums, setAlbums] = useState<AlbumVO[]>([]);
  const [albumSearch, setAlbumSearch] = useState("");
  const [albumLoading, setAlbumLoading] = useState(false);
  const [albumRefreshKey, setAlbumRefreshKey] = useState(0);

  // ─── 照片列表状态 ───
  const [photoSearch, setPhotoSearch] = useState("");
  const [photoAlbumFilter, setPhotoAlbumFilter] = useState<number | "">("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const debouncedPhotoSearch = useDebounce(photoSearch);

  const {
    page: photoPage,
    setPage: setPhotoPage,
    loading: photoLoading,
    pageResult: photoResult,
    records: photoRecords,
    refresh: refreshPhotos,
    reset: resetPhotos,
  } = usePagedList<PhotoVO>({
    pageSize: PAGE_SIZE,
    deps: [view, debouncedPhotoSearch, photoAlbumFilter],
    fetch: (page) =>
      view === "photo"
        ? getPhotoList({
            page,
            size: PAGE_SIZE,
            albumId: photoAlbumFilter === "" ? undefined : photoAlbumFilter,
            location: debouncedPhotoSearch.trim() || undefined,
          })
        : Promise.resolve(emptyPhotoPage),
  });

  // 加载相册列表
  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        setAlbumLoading(true);
        return getAlbumList({ page: 1, size: 100, albumName: albumSearch.trim() || undefined });
      })
      .then((res) => {
        if (cancelled) return;
        setAlbums(res?.records ?? []);
      })
      .catch(() => {
        if (!cancelled) setAlbums([]);
      })
      .finally(() => {
        if (!cancelled) setAlbumLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [albumSearch, albumRefreshKey]);

  const albumNameMap = new Map(albums.map((a) => [a.id, a.albumName]));

  // 删除相册
  const handleDeleteAlbum = async (id: number) => {
    if (!id) return;
    if (!(await confirm({ message: "确定要删除该相册吗？相册下的照片会一并删除，且不可恢复。" }))) return;
    setDeletingId(id);
    try {
      await deleteAlbum(id);
      notifySuccess("相册删除成功");
      setAlbumRefreshKey((k) => k + 1);
      refreshPhotos();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeletingId(null);
    }
  };

  // 删除照片
  const handleDeletePhoto = async (id: number) => {
    if (!id) return;
    if (!(await confirm({ message: "确定要删除这张照片吗？删除后不可恢复。" }))) return;
    setDeletingId(id);
    try {
      await deletePhoto(id);
      notifySuccess("照片删除成功");
      refreshPhotos();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeletingId(null);
    }
  };

  // 进入某相册的照片视图
  const handleOpenAlbumPhotos = (album: AlbumVO) => {
    setPhotoAlbumFilter(album.id);
    setView("photo");
  };

  // 上传照片：带上当前相册筛选作为默认相册
  const handleUploadPhoto = () => {
    const query = photoAlbumFilter === "" ? "" : `?albumId=${photoAlbumFilter}`;
    router.push(`/photos/photo/new${query}`);
  };

  // 重置相册筛选，并强制重新拉取相册列表
  const handleResetAlbum = () => {
    setAlbumSearch("");
    setAlbumRefreshKey((k) => k + 1);
  };

  // 重置照片筛选，并强制重新拉取照片列表
  const handleResetPhoto = () => {
    setPhotoSearch("");
    setPhotoAlbumFilter("");
    resetPhotos();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">相册管理</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView("album")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === "album" ? "bg-white text-foreground shadow-sm" : "text-gray-500"
              }`}
            >
              <Folder size={14} className="inline mr-1" />
              相册
            </button>
            <button
              onClick={() => setView("photo")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === "photo" ? "bg-white text-foreground shadow-sm" : "text-gray-500"
              }`}
            >
              <ImageIcon size={14} className="inline mr-1" />
              照片
            </button>
          </div>
          {view === "album" ? (
            <Link href="/photos/album/new" className="btn btn-primary">
              <Plus size={16} /> 新建相册
            </Link>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleUploadPhoto}
              disabled={albums.length === 0}
              title={albums.length === 0 ? "请先创建相册" : "上传照片"}
            >
              <Plus size={16} /> 上传照片
            </button>
          )}
        </div>
      </div>

      {/* ─────────── 相册视图 ─────────── */}
      {view === "album" && (
        <>
          <div className="card flex items-center gap-4">
            <div className="relative flex-9 min-w-0">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索相册..."
                className="input input-icon"
                value={albumSearch}
                onChange={(e) => setAlbumSearch(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary flex-1 min-w-0 justify-center whitespace-nowrap"
              onClick={handleResetAlbum}
              title="重置"
            >
              <RotateCcw size={16} /> 重置
            </button>
          </div>

          {albumLoading ? (
            <div className="card flex items-center justify-center py-16 text-gray-500">
              <Loader2 size={24} className="animate-spin mr-2" /> 加载中...
            </div>
          ) : albums.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
              <Folder size={36} className="mb-2" />
              暂无相册，点击右上角「新建相册」开始
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="card p-4 hover:shadow-md transition-shadow group"
                >
                  <div
                    className="aspect-4/3 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={() => handleOpenAlbumPhotos(album)}
                  >
                    {album.albumCover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={album.albumCover}
                        alt={album.albumName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={32} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="min-w-0 cursor-pointer"
                      onClick={() => handleOpenAlbumPhotos(album)}
                    >
                      <h3 className="font-medium text-foreground truncate">{album.albumName}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{album.albumDesc}</p>
                      <span className="text-xs text-gray-400 mt-2 block">
                        {toDateOnly(album.albumTime) || toDateOnly(album.createTime)}
                      </span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        className="p-1 rounded hover:bg-gray-100 text-blue-600"
                        title="编辑"
                        onClick={() => router.push(`/photos/album/edit?id=${album.id}`)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-gray-100 text-red-600 disabled:opacity-40"
                        title="删除"
                        onClick={() => handleDeleteAlbum(album.id)}
                        disabled={deletingId === album.id}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─────────── 照片视图 ─────────── */}
      {view === "photo" && (
        <>
          {photoAlbumFilter !== "" && (
            <button
              className="text-sm text-gray-500 hover:text-foreground flex items-center gap-1"
              onClick={() => {
                setPhotoAlbumFilter("");
                setView("album");
              }}
            >
              <ArrowLeft size={14} /> 返回相册
            </button>
          )}

          <div className="card flex items-center gap-3 md:gap-4">
            <div className="relative flex-6 min-w-0">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索拍摄地点..."
                className="input input-icon w-full"
                value={photoSearch}
                onChange={(e) => setPhotoSearch(e.target.value)}
              />
            </div>
            <Select
              className="flex-3 min-w-0"
              value={photoAlbumFilter}
              onChange={(v) => setPhotoAlbumFilter(v === "" ? "" : Number(v))}
              options={[
                { value: "", label: "全部相册" },
                ...albums.map((a) => ({ value: a.id, label: a.albumName })),
              ]}
            />
            <button
              type="button"
              className="btn btn-secondary flex-1 min-w-0 justify-center whitespace-nowrap"
              onClick={handleResetPhoto}
              title="重置"
            >
              <RotateCcw size={16} /> 重置
            </button>
          </div>

          <div className="card table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>照片</th>
                    <th>标题</th>
                    <th>所属相册</th>
                    <th>拍摄地点</th>
                    <th>拍摄日期</th>
                    <th>排序</th>
                    <th className="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {photoLoading ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-gray-500">
                        <div className="flex items-center justify-center">
                          <Loader2 size={24} className="animate-spin mr-2" /> 加载中...
                        </div>
                      </td>
                    </tr>
                  ) : photoRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-gray-400">
                        <div className="flex flex-col items-center justify-center">
                          <ImageIcon size={36} className="mb-2" /> 暂无照片
                        </div>
                      </td>
                    </tr>
                  ) : (
                    photoRecords.map((photo) => (
                    <tr key={photo.id}>
                      <td>
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto overflow-hidden">
                          {photo.photoSrc ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={photo.photoSrc}
                              alt={photo.photoAlt}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={16} className="text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="font-medium text-foreground">{photo.photoTitle || photo.photoAlt}</td>
                      <td>
                        <span className="badge badge-gray">
                          {albumNameMap.get(photo.albumId) ?? `#${photo.albumId}`}
                        </span>
                      </td>
                      <td>{photo.photoLocation || "—"}</td>
                      <td>{toDateOnly(photo.photoDate) || "—"}</td>
                      <td>{photo.sortOrder ?? 0}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                            title="编辑"
                            onClick={() => router.push(`/photos/photo/edit?id=${photo.id}`)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-40"
                            title="删除"
                            onClick={() => handleDeletePhoto(photo.id)}
                            disabled={deletingId === photo.id}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
          </div>

          <Pagination pageResult={photoResult} page={photoPage} onChange={setPhotoPage} />
        </>
      )}
    </div>
  );
}
