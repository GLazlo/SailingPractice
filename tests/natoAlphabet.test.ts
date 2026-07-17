import { describe, expect, it } from "vitest";
import { NATO_ALPHABET, buildGrammar, lookupLetterByToken } from "../src/domain/natoAlphabet";

describe("natoAlphabet", () => {
  it("has all 26 letters", () => {
    expect(NATO_ALPHABET).toHaveLength(26);
  });

  it("builds a grammar list including [unk]", () => {
    const grammar = buildGrammar();
    expect(grammar).toContain("[unk]");
    expect(grammar).toContain("alfa");
    expect(grammar).toContain("zulu");
  });

  it("maps canonical forms back to letters", () => {
    expect(lookupLetterByToken("alfa")).toBe("A");
    expect(lookupLetterByToken("zulu")).toBe("Z");
  });

  it("maps known alias forms back to letters", () => {
    expect(lookupLetterByToken("alpha")).toBe("A");
    expect(lookupLetterByToken("juliet")).toBe("J");
    expect(lookupLetterByToken("whisky")).toBe("W");
    expect(lookupLetterByToken("xray")).toBe("X");
    expect(lookupLetterByToken("x-ray")).toBe("X");
  });

  it("is case-insensitive", () => {
    expect(lookupLetterByToken("Papa")).toBe("P");
    expect(lookupLetterByToken("PAPA")).toBe("P");
  });

  it("returns null for unrecognized tokens", () => {
    expect(lookupLetterByToken("banana")).toBeNull();
    expect(lookupLetterByToken("")).toBeNull();
  });
});
