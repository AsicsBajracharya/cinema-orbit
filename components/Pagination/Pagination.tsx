import Link from "next/link";

export interface PaginationProps {
  page: number;
  hasNext: boolean;
  hrefFor: (page: number) => string;
  totalPages?: number;
}

const linkClass =
  "rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";
const disabledClass =
  "rounded-md border border-border px-3 py-2 text-sm text-muted opacity-50";

export function Pagination({ page, hasNext, hrefFor, totalPages }: PaginationProps) {
  const hasPrevious = page > 1;

  return (
    <nav
      aria-label="Pages"
      className="flex items-center justify-between gap-4"
    >
      {hasPrevious ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={linkClass}>
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          Previous
        </span>
      )}

      <p className="text-sm text-muted">
        {totalPages ? `Page ${page} of ${totalPages}` : `Page ${page}`}
      </p>

      {hasNext ? (
        <Link href={hrefFor(page + 1)} rel="next" className={linkClass}>
          Next
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          Next
        </span>
      )}
    </nav>
  );
}
