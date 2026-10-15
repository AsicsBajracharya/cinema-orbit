
import { movies } from "~/mock/fixtures/movies";
import { problem } from "~/mock/http";


const MAX_PAGE = 500;

// remove after api integration,
const PAGE_SIZE = 24

export async function GET(request: Request) {
  const pageParam = new URL(request.url).searchParams.get("page") ?? "1";
  const page = Number(pageParam);

  if (!/^\d+$/.test(pageParam) || page < 1 || page > MAX_PAGE) {
    return problem(
      400,
      "Invalid request",
      "The 'page' parameter must be a whole number from 1 to 500.",
    );
  }


  const start = (page - 1) * PAGE_SIZE;
  return Response.json(movies.slice(start, start + PAGE_SIZE));
}
