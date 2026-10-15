"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">
        Something went wrong
      </h1>
      <p role="alert" className="text-sm text-muted">
        We couldn&apos;t reach the movie API. It might be slow, down, or
        unreachable right now.
      </p>
      <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
      >
        Try again
      </button>
      <button
          type="button"
          onClick={() => window.location.assign("/")}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          Back to home
        </button>
      </div>
    </main>
  );
}
