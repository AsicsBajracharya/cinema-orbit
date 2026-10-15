// Shared helpers for the mock API route handlers. Kept under mocks/ so the mock stays easy to remove.

// Mirrors TMDB, which returns 20 results per page.
export const PAGE_SIZE = 24;

/** Builds an error response in the application/problem+json format the contract requires. */
export function problem(status: number, title: string, detail: string) {
  return new Response(
    JSON.stringify({ type: "about:blank", title, status, detail }),
    {
      status,
      headers: { "Content-Type": "application/problem+json" },
    },
  );
}
