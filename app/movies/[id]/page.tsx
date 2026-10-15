import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Rating } from "~/components/Rating";
import { Trailer } from "~/components/Trailer";
import { ApiError, getMovieDetail, getMovieVideos } from "~/lib/api";


export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const movie = await getMovieDetail(id);
    return { title: movie.title };
  } catch (error) {
    // A missing movie gets a sensible tab title. The page itself still
    // calls notFound() below, so the 404 response is unchanged.
    if (error instanceof ApiError && error.status === 404) {
      return { title: "Movie not found" };
    }
    throw error;
  }
}

export default async function MoviePage({
    params,
  }: {
    params: Promise<{ id: string }>;
  }){
    const { id } = await params;

    let movie;
    try {
      movie = await getMovieDetail(id);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        notFound();
      }
      throw error;
    }
    const videos = await getMovieVideos(id);
    const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : null;
    return (
        <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
          <Link
            href="/"
            className="w-fit text-sm text-muted underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            ← Back to search
          </Link>
    
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="relative aspect-2/3 w-full max-w-64 shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
              {movie.posterPath ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                  alt={`Poster for ${movie.title}`}
                  fill
                  priority
                  sizes="(min-width: 768px) 256px, 80vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted">
                  No poster
                </div>
              )}
            </div>
    
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-semibold text-foreground">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-base italic text-muted">{movie.tagline}</p>
                )}
              </div>
    
              <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                {year && (
                  <div>
                    <dt className="inline">Year: </dt>
                    <dd className="inline text-foreground">{year}</dd>
                  </div>
                )}
                <div>
                  <dt className="inline">Runtime: </dt>
                  <dd className="inline text-foreground">
                    {movie.runtime ? `${movie.runtime} min` : "Unknown"}
                  </dd>
                </div>
              <div>
                <dt className="inline">Rating: </dt>
                <dd className="inline text-foreground">
                  <Rating value={movie.voteAverage} />
                </dd>
              </div>
              </dl>
    
              {movie.genres.length > 0 && (
                <ul className="flex flex-wrap gap-2" aria-label="Genres">
                  {movie.genres.map((genre) => (
                    <li
                      key={genre}
                      className="rounded-full border border-border px-3 py-1 text-xs text-foreground"
                    >
                      {genre}
                    </li>
                  ))}
                </ul>
              )}
    
              <p className="max-w-prose text-sm leading-6 text-foreground">
                {movie.overview ?? "No overview available."}
              </p>
            </div>
          </div>

          <section aria-labelledby="trailer-heading" className="flex max-w-4xl flex-col gap-4">
        <h2 id="trailer-heading" className="text-lg font-medium text-foreground">
          Trailer
        </h2>
        <Trailer videos={videos} movieTitle={movie.title} />
      </section>
        </main>
      );
}