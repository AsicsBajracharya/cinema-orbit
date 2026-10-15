"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

interface SearchBarProps {
  defaultValue?: string;
}


export function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [syncedValue, setSyncedValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    const trimmed = query.trim();
    const href = trimmed ? `/?${new URLSearchParams({ query: trimmed })}` : "/";
    startTransition(() => router.push(href));
  }

  function handleClear() {
    setQuery("");
    inputRef.current?.focus();
    if (defaultValue) startTransition(() => router.push("/")); 
  }

  // URL changed (search finished, back/forward, clear): sync the input.
  if (defaultValue !== syncedValue) {
    setSyncedValue(defaultValue);
    setQuery(defaultValue);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <label htmlFor="movie-search" className="sr-only">
        Search for a movie
      </label>
      <div className="relative w-full">
        <input
          ref={inputRef}
          id="movie-search"
          type="search"
          name="query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for a movie…"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 pr-9 text-sm text-foreground placeholder:text-muted focus:border-brand-500 focus:outline-2 focus:outline-offset-2 focus:outline-brand-500 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute inset-y-0 right-1 my-auto flex h-7 w-7 items-center justify-center rounded text-muted outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        )}
      </div>

      <button
        type="submit"
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 focus:outline-2 focus:outline-offset-2 focus:outline-brand-500"
        aria-disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
