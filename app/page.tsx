import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Pagination } from "~/components/Pagination";
import { SearchBar } from "~/components/SearchBar";
import { SearchResults } from "~/components/SearchResults";
import { SearchResultsSkeleton } from "~/components/SearchResultsSkeleton";
import { TrendingGrid } from "~/components/TrendingGrid";
import { getTrendingMovies } from "~/lib/api";
import { firstParam, parsePage } from "~/lib/search-params/search-params";

// Renders per-request rather than being statically generated at build time,
// since this page depends on the .NET API being reachable — which it isn't
// during `next build` in CI.
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ query?: string | string[] }> }): Promise<Metadata> {
  const { query } = await searchParams;
  const q = (Array.isArray(query) ? query[0] : query)?.trim();
  return q ? { title: `Results for “${q}”` } : {};
}


const TRENDING_PAGE_SIZE = 24;

export default async function HomePage({
  searchParams
}:{
  searchParams: Promise<{ query?: string | string[]; page?: string | string[] }>;
}) {

  const { query: rawQuery, page: rawPage } = await searchParams;

  const query = firstParam(rawQuery)?.trim() ?? "";

  const page = parsePage(rawPage);
  if (page === null) {
    // Invalid page: send the user to the canonical URL (page 1, same query).
    redirect(query ? `/?${new URLSearchParams({ query })}` : "/");
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-foreground">
          Movie Search Case
        </h1>
        <SearchBar defaultValue={query} />
      </header>
      <Suspense key={`${query}:${page}`} fallback={<SearchResultsSkeleton />}>
        {query ? (
          <SearchResults query={query} page={page} />
        ) : (
          <TrendingPanel page={page} />
        )}
      </Suspense>
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
