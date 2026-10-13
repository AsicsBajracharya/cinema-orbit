import "server-only";

import type { Movie, MovieDetail, MovieSearchResponse } from "~/types/movie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local and point it at the running API.",
  );
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });

  if (!response.ok) {
    throw new ApiError(
      `Request to ${path} failed with status ${response.status}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

/** TMDB-backed trending movies fetch. */
export function getTrendingMovies(page = 1): Promise<Movie[]> {
  return apiFetch<Movie[]>(`/movies/trending?page=${page}`, { cache: "no-store" });
}

export function searchMovies(
  query: string,
  page = 1,
): Promise<MovieSearchResponse> {
  const params = new URLSearchParams({ query, page: String(page) });

  return apiFetch<MovieSearchResponse>(`/movies/search?${params}`);
}

export function getMovieDetail(id: string): Promise<MovieDetail> {
  return apiFetch<MovieDetail>(`/movies/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
}

