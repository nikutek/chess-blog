import { describe, expect, it } from "vitest";

import { isValidPgn } from "./pgn";

describe("isValidPgn", () => {
  it("accepts a standard move sequence", () => {
    expect(isValidPgn("1. e4 e5 2. Nf3 Nc6")).toBe(true);
  });

  it("accepts a single move", () => {
    expect(isValidPgn("1. e4")).toBe(true);
  });

  it("rejects blank input", () => {
    expect(isValidPgn("   ")).toBe(false);
  });

  it("rejects text without move numbers", () => {
    expect(isValidPgn("not a real pgn")).toBe(false);
  });

  it("rejects a move number with no move after it", () => {
    expect(isValidPgn("1.")).toBe(false);
  });

  it("accepts a move sequence preceded by tag-pair headers", () => {
    const pgn =
      '[Event "Titled Tuesday"]\n[Site "chess.com"]\n[Date "2026.08.02"]\n\n1. e4 e5 2. Nf3 Nc6';

    expect(isValidPgn(pgn)).toBe(true);
  });

  it("rejects tag-pair headers with no moves after them", () => {
    const pgn = '[Event "Titled Tuesday"]\n[Site "chess.com"]';

    expect(isValidPgn(pgn)).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidPgn("")).toBe(false);
  });

  it("rejects null", () => {
    expect(isValidPgn(null as unknown as string)).toBe(false);
  });
});
