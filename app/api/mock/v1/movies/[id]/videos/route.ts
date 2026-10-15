import { movieVideos } from "~/mock/fixtures/details";
import { movies } from "~/mock/fixtures/movies";
import { problem } from "~/mock/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const movieId = Number(id);

  if (!/^\d+$/.test(id) || !movies.some((item) => item.id === movieId)) {
    return problem(404, "Not Found", `Movie ${id} was not found.`);
  }

  // A movie with no entry has no videos. The response is still 200 with an empty array.
  return Response.json(movieVideos[movieId] ?? []);
}
