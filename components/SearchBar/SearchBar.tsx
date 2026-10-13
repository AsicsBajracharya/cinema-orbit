"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface SearchBarProps {
  defaultValue?: string;
}


export function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    const trimmed = query.trim();
    const href = trimmed
      ? `/?${new URLSearchParams({ query: trimmed }).toString()}`
      : "/";

    startTransition(() => router.push(href));
  }

  return (
    <form
    key={defaultValue}
    onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <label htmlFor="movie-search" className="sr-only">
        Search for a movie
      </label>
      <input
        id="movie-search"
        type="search"
        name="query"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search for a movie…"
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-brand-500 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
