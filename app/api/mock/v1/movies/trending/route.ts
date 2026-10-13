
import { movies } from "~/mock/fixtures/movies";

// remove after api integration,
const PAGE_SIZE = 24

export async function GET(request: Request) {
  const pageParam = new URL(request.url).searchParams.get("page") ?? "1";
  const page = Number(pageParam);

  const start = (page - 1) * PAGE_SIZE;
  return Response.json(movies.slice(start, start + PAGE_SIZE));
}
