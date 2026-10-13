import type { MovieDetail, MovieVideo } from "~/types/movie";

export const movieDetails: Partial<
  Record<number, Pick<MovieDetail, "runtime" | "tagline" | "genres">>
> = {
  969681: {
    runtime: 126,
    tagline: "The friendly neighbourhood Spider-Man is back.",
    genres: ["Action", "Adventure", "Science Fiction"],
  },
  1058424: {
    runtime: 110,
    tagline: null,
    genres: ["Mystery", "Thriller"],
  },
};

// Videos per movie ID. Missing IDs have no videos. The Vimeo entry checks that the frontend skips non-YouTube sites.
export const movieVideos: Partial<Record<number, MovieVideo[]>> = {
    969681: [
      {
        key: "dgC9Q0uhX70",
        name: "Official Trailer",
        site: "YouTube",
        type: "Trailer",
      },
    ],
    1058424: [
      {
        key: "123456789",
        name: "Teaser",
        site: "Vimeo",
        type: "Teaser",
      },
    ],
  };