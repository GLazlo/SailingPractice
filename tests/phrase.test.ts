import { describe, expect, it } from "vitest";
import { concat, matchPhrase, phrase, phraseWords, splitWords, term } from "../src/domain/phrase";

describe("phrase", () => {
  it("splits and normalizes spoken text", () => {
    expect(splitWords("Sea Breeze")).toEqual(["sea", "breeze"]);
    expect(splitWords("X-Ray")).toEqual(["x", "ray"]);
    expect(splitWords("  PAN  PAN ")).toEqual(["pan", "pan"]);
  });

  it("orders term alternates longest first", () => {
    expect(term("x", "x ray")).toEqual([["x", "ray"], ["x"]]);
  });

  it("collects every word a phrase can accept", () => {
    const p = concat(phrase("this is"), [term("alfa", "alpha")]);
    expect(phraseWords(p).sort()).toEqual(["alfa", "alpha", "is", "this"]);
  });

  describe("matchPhrase", () => {
    it("matches a full phrase and reports what it consumed", () => {
      const result = matchPhrase(phrase("this is"), ["this", "is", "sea"]);
      expect(result).toEqual({ kind: "full", consumed: 2 });
    });

    it("reports a prefix when the buffer runs out mid-phrase", () => {
      expect(matchPhrase(phrase("this is"), ["this"])).toEqual({ kind: "prefix" });
    });

    it("reports none when the first word already disagrees", () => {
      expect(matchPhrase(phrase("this is"), ["mayday"])).toEqual({ kind: "none" });
    });

    it("accepts any alternate of a term", () => {
      const p = [term("nine", "niner")];
      expect(matchPhrase(p, ["niner"])).toEqual({ kind: "full", consumed: 1 });
      expect(matchPhrase(p, ["nine"])).toEqual({ kind: "full", consumed: 1 });
    });

    it("prefers the longer alternate when both could apply", () => {
      const p = [term("x", "x ray")];
      expect(matchPhrase(p, ["x", "ray"])).toEqual({ kind: "full", consumed: 2 });
    });

    it("waits when only a longer alternate could still match", () => {
      expect(matchPhrase([term("x ray")], ["x"])).toEqual({ kind: "prefix" });
    });
  });
});
