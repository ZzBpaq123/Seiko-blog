import type { Metadata } from "next";
import { getAlbumList } from "@/api/photo";
import GalleryContent from "./GalleryContent";

export const metadata: Metadata = {
  title: "相册 - Seiko Blog",
  description: "记录生活中的美好瞬间",
};

export const revalidate = 300;

export default async function GalleryPage() {
  const albums = await getAlbumList().catch(() => []);

  return <GalleryContent initialAlbums={albums} />;
}
