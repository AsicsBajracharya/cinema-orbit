# Movie Search — Frontend (Next.js)

This is the frontend part of the DEPT Full-Stack Coding Challenge (Movie Search).

The app uses Next.js 16 (App Router) and Tailwind CSS.
It shows this week's trending movies, fetched from a backend API.

You work **without the real backend**. Instead, you build a small mock API that follows the [API contract](#api-contract) below.
A separate backend developer builds the real API against the same contract.
When both are done, your app must work with the real API by changing only `NEXT_PUBLIC_API_BASE_URL`.

## Your tasks

### P0: core task (do this first)

1. **Mock API**: build a mock that follows the [API contract](#api-contract).
   See [Mock API requirements](#mock-api-requirements).
2. **Search**: wire the search box (`components/SearchBar/`) to `GET /movies/search`.
   Add a `searchMovies(query, page)` function in `lib/api.ts`.
   Follow the same `apiFetch` pattern as `getTrendingMovies`.
   Render the results with the existing `MovieCard` and `TrendingGrid` components.
3. **Pagination**: add pagination UI driven by `page`, `totalPages` and `totalResults`.
   Next/prev, page numbers or infinite scroll: your choice.

### P1: expected once P0 works

- **Loading, empty and error states** for search.
  Handle them the same way as the trending section (see `app/loading.tsx` and `app/error.tsx`).
  Use the slow and error cases of your mock to show that they work.
- **Accessibility**: the app must work with a keyboard and a screen reader.
  Form controls need labels. Focus states need to be visible.

### P2: if you have time

- A **movie detail page** (`/movies/[id]` or similar) that uses `GET /movies/{id}`.
- Embed the **trailer** from YouTube, using `GET /movies/{id}/videos`.
- Add both endpoints to your mock.

### P3: stretch

- TV/series search next to movies.
- Caching or performance work on search (debouncing, revalidation).

### Guidelines

- Reuse the existing components and the Tailwind setup.
- Do not add a new state-management or styling approach.
  A mock API is allowed for this task. It is the only exception.
- Do not change the contract. If you think it is wrong, explain why in your notes.
- Be ready to explain your rendering strategy.
  What is server-rendered, what is client-rendered, and why?

## Using AI

You may use AI tools. They are a normal part of the job here, so use them if that is how you work.
We assess how you build the solution and how you reason about it.
Make sure your submission shows your own judgment and understanding.
Do not submit generated output that you have not reviewed.

## Mock API requirements

### Approach

We suggest **Next.js route handlers**, because they need no new tools.
For example, add routes under `app/api/mock/v1/movies/`.
Then set this in `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/mock/v1
```

You may choose another approach, such as MSW (Mock Service Worker) or json-server.
If you do, explain why in your notes.

### Rules

- Return fixed JSON data (fixtures). Do not call TMDB from the mock.
- Keep the mock separate from the app code, so it is easy to remove later.
- The app code must not know it talks to a mock.
  Only the base URL changes.

### Cases the mock must cover

| Endpoint | Case | How to trigger it (suggestion) |
|---|---|---|
| `GET /movies/trending` | Normal list | Always |
| `GET /movies/search` | Results over several pages (at least 3) | Any normal query, for example `batman` |
| `GET /movies/search` | No results | Query `noresults` |
| `GET /movies/search` | Slow response (about 3 seconds) | Query `slow` |
| `GET /movies/search` | Server error (`503`) | Query `error` |
| `GET /movies/search` | Invalid request (`400`) | Empty `query`, or `page` out of range |
| `GET /movies/{id}` (P2) | Movie found, and not found (`404`) | Known and unknown IDs |
| `GET /movies/{id}/videos` (P2) | With a trailer, and with no videos | Different IDs |

You may pick other trigger values. List them in your notes so reviewers can try each case.

## API contract

The frontend and backend are built separately. Both sides must follow this contract exactly.
Do not change field names or shapes.

- Base URL: `http://localhost:5080/api/v1`
- Field names use camelCase.
- Dates use the format `YYYY-MM-DD`.
- Fields marked `| null` can be `null`.

### Movie object

All movie endpoints use this shape. It is the same shape the trending endpoint returns today.

```json
{
  "id": 268,
  "title": "Batman",
  "overview": "Batman must face his most ruthless nemesis…",
  "posterPath": "/cij4dd21v2Rk2YtUQbV5kW69WB2.jpg",
  "backdropPath": "/2va32apQP97gvUxaMnL5wYt4CRB.jpg",
  "voteAverage": 7.2,
  "releaseDate": "1989-06-21"
}
```

`overview`, `posterPath`, `backdropPath` and `releaseDate` are `string | null`.

### `GET /movies/trending` (already built)

Returns an array of movie objects: `Movie[]`.

### `GET /movies/search?query={query}&page={page}` (P0)

| Parameter | Required | Rules |
|---|---|---|
| `query` | yes | Not empty and not only spaces. |
| `page` | no | Whole number from 1 to 500. Default is 1. |

Response `200 OK`:

```json
{
  "page": 1,
  "totalPages": 12,
  "totalResults": 231,
  "results": [ /* Movie objects, up to 20 per page */ ]
}
```

When nothing matches, the response is still `200 OK`.
It has `"totalPages": 0`, `"totalResults": 0` and `"results": []`.

### `GET /movies/{id}` (P2)

Response `200 OK`: a movie object with three extra fields.

```json
{
  "id": 268,
  "title": "Batman",
  "overview": "…",
  "posterPath": "…",
  "backdropPath": "…",
  "voteAverage": 7.2,
  "releaseDate": "1989-06-21",
  "runtime": 126,
  "tagline": "Have you ever danced with the devil in the pale moonlight?",
  "genres": ["Fantasy", "Action", "Crime"]
}
```

`runtime` is in minutes and is `number | null`. `tagline` is `string | null`.
If the movie does not exist, the response is `404 Not Found`.

### `GET /movies/{id}/videos` (P2)

Response `200 OK`: an array of videos. It is empty when the movie has no videos.

```json
[
  {
    "key": "dgC9Q0uhX70",
    "name": "Official Trailer",
    "site": "YouTube",
    "type": "Trailer"
  }
]
```

The frontend embeds a YouTube video with `https://www.youtube.com/embed/{key}`.
It only uses videos where `site` is `"YouTube"`.

### Errors

Every error uses the existing `application/problem+json` format:

```json
{
  "type": "about:blank",
  "title": "Invalid request",
  "status": 400,
  "detail": "The 'query' parameter is required."
}
```

| Status | When |
|---|---|
| `400 Bad Request` | A parameter breaks the rules above. |
| `404 Not Found` | The movie does not exist. |
| `503 Service Unavailable` | TMDB is down or did not respond. |
| `500 Internal Server Error` | Any other failure. |

## Getting started

You need Node 22+ and [pnpm](https://pnpm.io/installation).
You do **not** need .NET or a TMDB token.

```bash
cp .env.example .env.local
# the default already points at http://localhost:3000/api/mock/v1
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000`.

Until your mock serves `GET /movies/trending`, the home page shows the error screen.
This is expected, because the page loads trending movies on every request.
Build the trending mock first.

## Checks

```bash
pnpm lint && pnpm typecheck && pnpm test
```

## Submitting

Include a short note on:

- What you prioritized and what you skipped, and why.
- How you built the mock, and the trigger values for each case.
- Your rendering strategy (server vs client rendering) and the reasons for it.
