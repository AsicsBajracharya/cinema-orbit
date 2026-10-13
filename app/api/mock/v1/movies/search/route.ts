import { movies } from "~/mock/fixtures/movies";
import { PAGE_SIZE, problem } from "~/mock/http";
import type { Movie, MovieSearchResponse } from "~/types/movie";

// Trigger values (compared case-insensitively). Any other query returns the normal list.
// Route files may only export HTTP handlers, so these stay module-private.
const NO_RESULTS_QUERY = "noresults";
const SLOW_QUERY = "slow";
const ERROR_QUERY = "error";

const SLOW_DELAY_MS = 3000;
const MAX_PAGE = 500;

function toSearchResponse(all: Movie[], page: number): MovieSearchResponse {
  const start = (page - 1) * PAGE_SIZE;

  return {
    page,
    totalPages: Math.ceil(all.length / PAGE_SIZE),
    totalResults: all.length,
    results: all.slice(start, start + PAGE_SIZE),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";
  const pageParam = searchParams.get("page") ?? "1";

  if (query === "") {
    return problem(
      400,
      "Invalid request",
      "The 'query' parameter is required.",
    );
  }

  const page = Number(pageParam);
  if (!/^\d+$/.test(pageParam) || page < 1 || page > MAX_PAGE) {
    return problem(
      400,
      "Invalid request",
      "The 'page' parameter must be a whole number from 1 to 500.",
    );
  }

  const trigger = query.toLowerCase();

  if (trigger === ERROR_QUERY) {
    return problem(
      503,
      "Service Unavailable",
      "TMDB is down or did not respond.",
    );
  }

  if (trigger === SLOW_QUERY) {
    await new Promise((resolve) => setTimeout(resolve, SLOW_DELAY_MS));
  }

  if (trigger === NO_RESULTS_QUERY) {
    return Response.json(toSearchResponse([], page));
  }

  return Response.json(toSearchResponse(movies, page));
}
