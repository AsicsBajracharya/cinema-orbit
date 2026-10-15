export function SearchResultsSkeleton() {
  return (
    <section
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex flex-col gap-4"
    >
      <span className="sr-only">Loading movies…</span>
      <div aria-hidden="true" className="h-6 w-48 motion-safe:animate-pulse rounded bg-surface" />
      <div
        aria-hidden="true"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      >
        {Array.from({ length: 20 }, (_, index) => (
          <div
            key={index}
            className="aspect-2/3 w-full motion-safe:animate-pulse rounded-lg bg-surface"
          />
        ))}
      </div>
    </section>
  );
}
