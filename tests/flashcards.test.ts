import { describe, expect, it } from "vitest";
import { MAX_BOX, boxOf, countLearned, grade, pickNext } from "../src/domain/flashcards";

describe("flashcards", () => {
  it("moves a known card up one box and caps at the top", () => {
    let progress = grade({}, "a", true);
    expect(boxOf(progress, "a")).toBe(1);
    for (let i = 0; i < 10; i++) progress = grade(progress, "a", true);
    expect(boxOf(progress, "a")).toBe(MAX_BOX);
  });

  it("sends a missed card back to the first box", () => {
    const progress = grade({ a: 3 }, "a", false);
    expect(boxOf(progress, "a")).toBe(0);
  });

  it("treats unknown or corrupt boxes as new", () => {
    expect(boxOf({}, "a")).toBe(0);
    expect(boxOf({ a: -2 }, "a")).toBe(0);
    expect(boxOf({ a: 99 }, "a")).toBe(MAX_BOX);
  });

  it("never repeats the previous card when there is another", () => {
    for (let i = 0; i < 20; i++) {
      expect(pickNext(["a", "b"], {}, "a", () => i / 20)).toBe("b");
    }
  });

  it("repeats the only card rather than stopping", () => {
    expect(pickNext(["a"], {}, "a")).toBe("a");
    expect(pickNext([], {}, null)).toBeNull();
  });

  it("favours cards in low boxes", () => {
    // Weights: a (box 0) = 16, b (box 4) = 1.
    const progress = { a: 0, b: MAX_BOX };
    expect(pickNext(["a", "b"], progress, null, () => 0.9)).toBe("a");
    expect(pickNext(["a", "b"], progress, null, () => 0.99)).toBe("b");
  });

  it("counts cards answered three times in a row as learned", () => {
    expect(countLearned(["a", "b", "c"], { a: 3, b: 2, c: 4 })).toBe(2);
  });
});
