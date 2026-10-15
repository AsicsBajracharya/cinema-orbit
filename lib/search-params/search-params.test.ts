import { describe, expect, it } from "vitest";
import { MAX_PAGE, parsePage } from "./search-params";

describe("parsePage", () => {
  it("defaults to 1 when missing", () => expect(parsePage(undefined)).toBe(1));
  it("accepts valid pages", () => {
    expect(parsePage("1")).toBe(1);
    expect(parsePage(String(MAX_PAGE))).toBe(MAX_PAGE);
  });
  it("uses the first of repeated values", () => expect(parsePage(["3", "9"])).toBe(3));
  it.each(["abc", "0", "-1", "1.5", "", " 2", String(MAX_PAGE + 1)])(
    "rejects %j",
    (value) => expect(parsePage(value)).toBeNull(),
  );
});