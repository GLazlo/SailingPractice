import { describe, expect, it } from "vitest";
import { applyTranscript, createMatch } from "../src/domain/matcher";

describe("matcher", () => {
  it("advances through a full correct sequence", () => {
    const state = createMatch("APE");
    let result = applyTranscript(state, ["alfa"]);
    expect(result.state.pointer).toBe(1);
    expect(result.state.done).toBe(false);

    result = applyTranscript(result.state, ["papa"]);
    expect(result.state.pointer).toBe(2);

    result = applyTranscript(result.state, ["echo"]);
    expect(result.state.pointer).toBe(3);
    expect(result.state.done).toBe(true);
  });

  it("ignores wrong-letter tokens without resetting progress", () => {
    const state = createMatch("APE");
    const result = applyTranscript(state, ["tango"]);
    expect(result.state.pointer).toBe(0);
    expect(result.state.done).toBe(false);
    expect(result.rejected).toEqual(["tango"]);
  });

  it("handles repeated letters requiring the phonetic word twice", () => {
    const state = createMatch("HELLO");
    const sequence = ["hotel", "echo", "lima", "lima", "oscar"];
    const result = applyTranscript(state, sequence);
    expect(result.state.done).toBe(true);
    expect(result.state.pointer).toBe(5);
  });

  it("accepts alias forms as valid matches", () => {
    const state = createMatch("AW");
    const result = applyTranscript(state, ["alpha", "whisky"]);
    expect(result.state.done).toBe(true);
  });

  it("treats empty or garbage tokens as rejected, not progress", () => {
    const state = createMatch("AB");
    const result = applyTranscript(state, ["", "banana", "alfa"]);
    expect(result.state.pointer).toBe(1);
    expect(result.rejected).toEqual(["", "banana"]);
  });

  it("stops accepting tokens once done", () => {
    const state = createMatch("A");
    let result = applyTranscript(state, ["alfa"]);
    expect(result.state.done).toBe(true);
    result = applyTranscript(result.state, ["bravo"]);
    expect(result.rejected).toEqual([]);
    expect(result.state.pointer).toBe(1);
  });

  it("marks a zero-length word as immediately done", () => {
    const state = createMatch("");
    expect(state.done).toBe(true);
  });
});
