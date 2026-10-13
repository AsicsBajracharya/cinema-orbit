import { Pagination } from "~/components/Pagination";
import { TrendingGrid } from "~/components/TrendingGrid";
import { searchMovies } from "~/lib/api";

export interface SearchResultsProps {
  query: string;
  page: number;
}

export async function SearchResults({ query, page }: SearchResultsProps) {
  const result = await searchMovies(query, page);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-medium text-foreground">
        Results for “{query}”
      </h2>

      {result.totalResults === 0 ? (
        <p role="status" className="text-sm text-muted">
          No movies match “{query}”. Try a different title.
        </p>
      ) : (
        <>
          <p role="status" className="text-sm text-muted">
            {result.totalResults} movies found
          </p>

          {result.results.length > 0 ? (
            <TrendingGrid movies={result.results} />
          ) : (
            <p className="text-sm text-muted">No movies on this page.</p>
          )}

          {result.totalPages > 1 && (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              hasNext={result.page < result.totalPages}
              hrefFor={(target) =>
                `/?${new URLSearchParams({ query, page: String(target) }).toString()}`
              }
            />
          )}
        </>
      )}
    </section>
  );
}
