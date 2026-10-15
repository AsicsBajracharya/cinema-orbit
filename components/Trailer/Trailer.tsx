import type { MovieVideo } from "~/types/movie";

export interface TrailerProps {
  videos: MovieVideo[];
  movieTitle: string;
}

// Only YouTube videos can be embedded. Prefer one marked as a trailer, otherwise use the first YouTube video.
export function pickTrailer(videos: MovieVideo[]): MovieVideo | null {
  const youtube = videos.filter((video) => video.site === "YouTube");

  return (
    youtube.find((video) => video.type === "Trailer") ?? youtube[0] ?? null
  );
}

export function Trailer({ videos, movieTitle }: TrailerProps) {
  const trailer = pickTrailer(videos);

  if (!trailer) {
    return <p className="text-sm text-muted">No trailer available.</p>;
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
      <iframe
        src={`https://www.youtube.com/embed/${encodeURIComponent(trailer.key)}`}
        title={`${trailer.name} for ${movieTitle}`}
        loading="lazy"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
