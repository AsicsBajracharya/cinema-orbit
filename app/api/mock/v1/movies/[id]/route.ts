import { movies } from "~/mock/fixtures/movies";
import { problem } from "~/mock/http";
import type { MovieDetail } from "~/types/movie";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const movieId = Number(id);
  const movie = movies.find((item) => item.id === movieId);

  if (!/^\d+$/.test(id) || !movie) {
    return problem(404, "Not Found", `Movie ${id} was not found.`);
  }

  const detail: MovieDetail = {
    ...movie,
    runtime: 126,
    tagline: "Have you ever danced with the devil in the pale moonlight?",
    genres: ["Fantasy", "Action", "Crime"]
  };

  return Response.json(detail);
}