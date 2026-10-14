import { Pagination } from "~/components/Pagination";
import { SearchBar } from "~/components/SearchBar";
import { SearchResults } from "~/components/SearchResults";
import { TrendingGrid } from "~/components/TrendingGrid";
import { getTrendingMovies } from "~/lib/api";

// Renders per-request rather than being statically generated at build time,
// since this page depends on the .NET API being reachable — which it isn't
// during `next build` in CI.
export const dynamic = "force-dynamic";


const TRENDING_PAGE_SIZE = 24;

export default async function HomePage({
  searchParams
}:{
  searchParams: Promise<{query?: string; page?: string}>;
}) {

  const { query: rawQuery, page: rawPage } = await searchParams;

  const query = rawQuery?.trim() ?? "";
  const page = Number(rawPage ?? 1);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-foreground">
          Movie Search Case
        </h1>
        <SearchBar defaultValue={query} />
      </header>

      {query ? (
        <SearchResults query={query} page={page} />
      ) : (
        <TrendingPanel page={page} />
      )}
    </main>
  );
}


async function TrendingPanel({ page }: { page: number }) {
  const movies = await getTrendingMovies(page);
  const hasNext = movies.length === TRENDING_PAGE_SIZE;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-medium text-foreground">
        Trending this week
      </h2>
      <TrendingGrid movies={movies} />
      {(page > 1 || hasNext) && (
        <Pagination
          page={page}
          hasNext={hasNext}
          hrefFor={(target) => `/?page=${target}`}
        />
      )}
    </section>
  );
}
