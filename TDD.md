# Technical Design: Movie Search

## 1. What Was Prioritized and What Was Skipped

### Prioritized

- **P0 (Core):** A mock API that follows the README contract, search wired to the URL, and pagination. These come first because the rest depends on them.
- **P1 (States and Accessibility):** Loading, empty, and error states for search, plus labelled form controls and visible focus styles.
- **P2 (Detail):** A movie detail page with a YouTube trailer, backed by the detail and videos endpoints in the mock.
- **P3 (Performance):** Caching for list and detail data, and a single retry for temporary server errors.



### Skipped, and Why

- **TV and series search:** The README says not to change the contract, and TV search needs endpoints the backend doesn’t define. Adding them would require an agreed contract change first.
- **Debouncing:** Search runs on submit, not as the user types, so there are no repeated requests to debounce.
- **Client-side pagination:** Pages are URL-driven links, which work without JavaScript and need no client state.
- **Loading skeleton:** A streamed loading boundary didn’t finish rendering in this setup, so loading shows as a pending state on the search button instead.



## 2. Mock API

The mock is a set of Next.js route handlers under `app/api/mock/v1/`, backed by fixed data in `mocks/`. The app doesn’t know it’s talking to a mock. Only `NEXT_PUBLIC_API_BASE_URL` changes when the real backend is ready.

### How It’s Built

- `mocks/fixtures/movies.ts` holds 113 movies in the contract’s shape.
- `mocks/fixtures/details.ts` adds runtime, tagline, and genres for one movie, and videos for two.
- `mocks/http.ts` has one helper that builds every error response in the `problem+json` format.
- Each endpoint is a route handler that validates its input, then returns fixture data.



### Trigger Values

Trigger values are compared without regard to case.


| Endpoint                  | Input                                   | Result                                                               |
| ------------------------- | --------------------------------------- | -------------------------------------------------------------------- |
| `GET /movies/trending`    | Page 1 to 500                           | `200`, a page of 20 movies. Pages past the end return an empty list. |
| `GET /movies/trending`    | Page outside 1 to 500                   | `400`                                                                |
| `GET /movies/search`      | Empty or blank `query`                  | `400`                                                                |
| `GET /movies/search`      | `page` not a whole number from 1 to 500 | `400`                                                                |
| `GET /movies/search`      | `query=error`                           | `503`                                                                |
| `GET /movies/search`      | `query=slow`                            | `200`, after a short delay                                           |
| `GET /movies/search`      | `query=noresults`                       | `200`, zero results                                                  |
| `GET /movies/search`      | Any other valid query                   | `200`, paged fixture list                                            |
| `GET /movies/{id}`        | `969681`                                | `200`, full detail                                                   |
| `GET /movies/{id}`        | Unknown ID                              | `404`                                                                |
| `GET /movies/{id}/videos` | `969681`                                | `200`, one YouTube trailer                                           |
| `GET /movies/{id}/videos` | `1058424`                               | `200`, one Vimeo video (the frontend skips it)                       |
| `GET /movies/{id}/videos` | Other known ID                          | `200`, empty list                                                    |
| `GET /movies/{id}/videos` | Unknown ID                              | `404`                                                                |


Search doesn’t filter by title. Any valid query returns the same fixture list, which follows the README’s rule for fixed data.

## 3. Rendering Strategy



### Server-Rendered

- The home page, search results, and pagination. The page reads the URL, fetches the data, and sends finished HTML.
- The movie detail page, including the trailer. A missing movie returns a real `404`.
- Cards, the grid, and the not-found page, which only render markup.



### Client-Rendered

- The search box. It holds the typed text and shows a pending state while the new results load.
- The error screen. Next requires error boundaries to be client components.



### Why This Split

- **Less JavaScript:** Only two small client components ship code to the browser.
- **Results arrive in the first response:** Useful for first paint and the largest content element.
- **The API stays on the server:** The browser never calls the mock or the real backend directly.
- **State lives in the URL:** Search and page survive refresh, back, forward, and bookmarks.



### Trade-Off

Each page change waits for the server. A client-side pager would update instantly, but it would need its own state and fetching logic.