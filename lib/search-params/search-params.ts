export const MAX_PAGE = 500; // TMDB caps pages at 500

type ParamValue = string | string[] | undefined;

/** Repeated params (?q=a&q=b) arrive as arrays; use the first value. */
export function firstParam(value: ParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Returns a page number in 1..MAX_PAGE, or null if the value is invalid
 * (abc, 0, -1, 1.5, "", above MAX_PAGE). A missing param means page 1.
 */
export function parsePage(raw: ParamValue): number | null {
  const value = firstParam(raw);
  if (value === undefined) return 1;
  if (!/^\d+$/.test(value)) return null;

  const page = Number(value);
  return page >= 1 && page <= MAX_PAGE ? page : null;
}