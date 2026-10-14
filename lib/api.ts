import "server-only";

import type { Movie, MovieDetail, MovieSearchResponse, MovieVideo } from "~/types/movie";

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

// Only GET requests are retried, so a retry can never repeat a write. Every call in this app is a GET.
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const retryable = !init?.method || init.method === "GET";

  for (let attempt = 1; ; attempt++) {
    const canRetry = retryable && attempt < MAX_ATTEMPTS;

    try {
      // Next reuses identical GET requests within one render, so each attempt gets its own header.
      // Without it, a retry would return the first attempt's response.
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
          Accept: "application/json",
          ...init?.headers,
          "X-Attempt": String(attempt),
        },
      });

      if (response.ok) {
        return (await response.json()) as T;
      }

      // 5xx may be temporary. 4xx means the request itself is wrong, so do not retry it.
      if (response.status < 500 || !canRetry) {
        throw new ApiError(
          `Request to ${path} failed with status ${response.status}`,
          response.status,
        );
      }
    } catch (error) {
      if (error instanceof ApiError || !canRetry) {
        throw error;
      }
      // Network failure (fetch threw): fall through to the retry delay.
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
  }
}


const LIST_REVALIDATE_SECONDS = 60;
const DETAIL_REVALIDATE_SECONDS = 300;

/** TMDB-backed trending movies fetch. */
export function getTrendingMovies(page = 1): Promise<Movie[]> {
  return apiFetch<Movie[]>(`/movies/trending?page=${page}`, {
    next: { revalidate: LIST_REVALIDATE_SECONDS },
  });
}

export function searchMovies(
  query: string,
  page = 1,
): Promise<MovieSearchResponse> {
  const params = new URLSearchParams({ query, page: String(page) });

  return apiFetch<MovieSearchResponse>(`/movies/search?${params}`,{
    next: { revalidate: LIST_REVALIDATE_SECONDS },
  });
}

export function getMovieDetail(id: string): Promise<MovieDetail> {
  return apiFetch<MovieDetail>(`/movies/${encodeURIComponent(id)}`, {
    next: { revalidate: DETAIL_REVALIDATE_SECONDS },
  });
}

export function getMovieVideos(id: string): Promise<MovieVideo[]> {
  return apiFetch<MovieVideo[]>(`/movies/${encodeURIComponent(id)}/videos`, {
    next: { revalidate: DETAIL_REVALIDATE_SECONDS },
  });
}


