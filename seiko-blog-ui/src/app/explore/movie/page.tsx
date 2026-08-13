import type { Metadata } from "next";
import { getMovieList } from "@/api/movie";
import MovieClient from "./MovieClient";

export const metadata: Metadata = {
  title: "影视 - Seiko Blog",
  description: "探索影视的世界",
};

export const revalidate = 300;

export default async function MoviePage() {
  const movies = await getMovieList().catch(() => []);

  return <MovieClient initialMovies={movies} />;
}
