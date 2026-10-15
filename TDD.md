# Technical Design: Movie Search

## 1. What Was Prioritized and What Was Skipped

### Prioritized

- **P0 (Core):** A mock API that follows the README contract, search wired to the URL, and pagination. These come first because the rest depends on them.
- **P1 (States and Accessibility):** Loading, empty, and error states for search, validated page parameters, a search box that can be cleared, plus labelled form controls and visible focus styles.
- **P2 (Detail):** A movie detail page with a YouTube trailer, backed by the detail and videos endpoints in the mock.
- **P3 (Performance and Resilience):** Caching for list and detail data, and retries for temporary server errors.



### Skipped, and Why

- **TV and series search:** The README says not to change the contract, and TV search needs endpoints the backend doesn't define. Adding them would require an agreed contract change first.
- **Debouncing:** Search runs on submit, not as the user types, so there are no repeated requests to debounce.
- **Client-side pagination:** Pages are URL-driven links, which work without JavaScript and need no client state.

## 2. Mock API

The mock is a set of Next.js route handlers under `app/api/mock/v1/`, backed by fixed data in `mock/`. The app doesn't know it's talking to a mock. Only `NEXT_PUBLIC_API_BASE_URL` changes when the real backend is ready.

### How It's Built

- `mock/fixtures/movies.ts` holds 113 movies in the contract's shape.
- `mock/fixtures/details.ts` adds runtime, tagline, and genres for one movie, and videos for two.
- `mock/http.ts` has one helper that builds every error response in the `problem+json` format.
- Each endpoint is a route handler that validates its input, then returns fixture data.



### Trigger Values

Trigger values are compared without regard to case.


| Endpoint                  | Input                                   | Result                                                               |
| ------------------------- | --------------------------------------- | -------------------------------------------------------------------- |
| `GET /movies/trending`    | Page 1 to 500                           | `200`, a page of 24 movies. Pages past the end return an empty list. |
| `GET /movies/trending`    | Page outside 1 to 500                   | `400`                                                                |
| `GET /movies/search`      | Empty or blank `query`                  | `400`                                                                |
| `GET /movies/search`      | `page` not a whole number from 1 to 500 | `400`                                                                |
| `GET /movies/search`      | `query=error`                           | `503`                                                                |
| `GET /movies/search`      | `query=slow`                            | `200`, after a 3 second delay                                        |
| `GET /movies/search`      | `query=noresults`                       | `200`, zero results                                                  |
| `GET /movies/search`      | Any other valid query                   | `200`, paged fixture list                                            |
| `GET /movies/{id}`        | `969681`                                | `200`, full detail                                                   |
| `GET /movies/{id}`        | Unknown ID                              | `404`                                                                |
| `GET /movies/{id}/videos` | `969681`                                | `200`, one YouTube trailer                                           |
| `GET /movies/{id}/videos` | `1058424`                               | `200`, one Vimeo video (the frontend skips it)                       |
| `GET /movies/{id}/videos` | Other known ID                          | `200`, empty list                                                    |
| `GET /movies/{id}/videos` | Unknown ID                              | `404`                                                                |


Search doesn't filter by title. Any valid query returns the same fixture list, which follows the README's rule for fixed data.

## 3. Rendering Strategy



### Server-Rendered

- The home page, search results, and pagination. The page reads the URL, fetches the data, and sends finished HTML.
- The movie detail page, including the trailer. A missing movie returns a real `404`.
- Cards, the grid, and the not-found page, which only render markup.



### Client-Rendered

- The search box. It holds the typed text, shows a pending state while the new results load, and has a clear button.
- The error screen. Next requires error boundaries to be client components.



### Why This Split

- **Less JavaScript:** Only two small client components ship code to the browser.
- **Results arrive in the first response:** Useful for first paint and the largest content element.
- **The API stays on the server:** The browser never calls the mock or the real backend directly.
- **State lives in the URL:** Search and page survive refresh, back, forward, and bookmarks.



### Trade-Off

Each page change waits for the server. A client-side pager would update instantly, but it would need its own state and fetching logic.

## 4. Loading, Errors, and Input Validation



### Loading

- The results area sits inside a `Suspense` boundary whose key is the query and page. Each new search or page change remounts it, so the skeleton shows again. A `loading.tsx` file alone would not, because it doesn't run when only the search parameters change.
- The skeleton is exposed as a status region with hidden text ("Loading movies…") and `aria-busy`.
- The search button also shows "Searching…" while the navigation is pending. It uses `aria-disabled` and not `disabled`, so it keeps keyboard focus, and a second submit is ignored while pending.



### Errors

- A failed API call renders the error screen with an alert and two actions: "Try again" and "Back to home".
- "Try again" calls the error boundary's `reset`, which re-renders the page.
- The API client retries `GET` requests up to 3 attempts on network failures and `5xx` responses, waiting 1 and 2 seconds between attempts. A `4xx` is never retried, because the request itself is wrong.



### Page Parameter Validation

- The `page` value must be a whole number from 1 to 500. Repeated values use the first one.
- Anything else (`abc`, `0`, `-1`, `1.5`, over 500) redirects to the same page without it, so the URL becomes `/` or `/?query=…`. Bad values never reach the API, so they no longer show the "unreachable" error screen.
- A valid page past the end redirects: search goes to the last page, and trending goes to `/` when a page after the first returns no results.



### Search Box and Reset

- The input starts from the current `query` in the URL, and re-syncs whenever the URL changes (search finishes, back, forward, clear). This is done by comparing the previous and new values during render, not by remounting the form, because a remount would drop keyboard focus.
- A clear button appears when there's text. It empties the box, returns focus to it, and goes to `/` (trending, page 1). If the URL already has no query, it only clears the text.
- The browser's built-in clear icon is hidden so that only one is shown.



## 5. Caching and Retries

- **Search:** `no-store`, so results are always fresh.
- **Trending list:** revalidated every 60 seconds.
- **Detail and videos:** revalidated every 300 seconds.
- **Retries:** each attempt sends its own `X-Attempt` header. Next reuses identical `GET` requests within one render, so without it a retry would return the first attempt's response.

