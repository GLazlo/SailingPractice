import { describe, expect, it } from "vitest";
import {
  applyCallTokens,
  countEarlyTerminators,
  createCallMatch,
  finalizeCallMatch,
  scoreCall,
  type CallMatchState
} from "../src/domain/callMatcher";
import { buildCall, NATURE_OPTIONS, type CallType } from "../src/domain/radioCalls";
import { speak, speakWithout, TEST_CONTEXT, TEST_IDENTITY } from "./support/speak";

const ALL_TYPES: CallType[] = ["securite", "panpan", "mayday"];

function makeCall(type: CallType) {
  return buildCall(type, TEST_IDENTITY, {
    ...TEST_CONTEXT,
    natureId: NATURE_OPTIONS[type][0].id
  });
}

/** Feed tokens one at a time, the way the recognizer delivers them. */
function run(call: ReturnType<typeof makeCall>, tokens: string[]) {
  let state = createCallMatch(call);
  const rejected: string[] = [];
  for (const token of tokens) {
    const result = applyCallTokens(call, state, [token]);
    state = result.state;
    rejected.push(...result.rejected);
  }
  return { state, rejected };
}

function statusOf(call: ReturnType<typeof makeCall>, state: CallMatchState, id: string) {
  const index = call.slots.findIndex((s) => s.id === id);
  return state.slots[index].status;
}

describe("callMatcher", () => {
  it("scores a correctly delivered message at 100% for every call type", () => {
    for (const type of ALL_TYPES) {
      const call = makeCall(type);
      const { state } = run(call, speak(call));
      expect(state.done, `${type} should end on its terminator`).toBe(true);
      const score = scoreCall(call, state);
      expect(score.percent, `${type} score`).toBe(100);
      expect(score.matched).toBe(score.total);
    }
  });

  it("ends the attempt when the terminator is reached", () => {
    const call = makeCall("mayday");
    const { state } = run(call, speak(call));
    expect(statusOf(call, state, "over")).toBe("matched");
    expect(state.done).toBe(true);
  });

  it("does not end the attempt on an over spoken too early", () => {
    const call = makeCall("mayday");
    const tokens = speak(call);
    const withEarlyOver = ["mayday", "mayday", "over", ...tokens.slice(2)];
    const { state, rejected } = run(call, withEarlyOver);

    expect(rejected).toContain("over");
    expect(countEarlyTerminators(rejected)).toBeGreaterThan(0);
    // The message still completes normally afterwards.
    expect(state.done).toBe(true);
    expect(scoreCall(call, state).percent).toBe(100);
  });

  it("marks a skipped element as missed without stalling the rest", () => {
    const call = makeCall("mayday");
    const { state } = run(call, speakWithout(call, "position"));

    expect(statusOf(call, state, "position")).toBe("missed");
    expect(statusOf(call, state, "nature")).toBe("matched");
    expect(statusOf(call, state, "over")).toBe("matched");

    const score = scoreCall(call, state);
    expect(score.matched).toBe(score.total - 1);
  });

  it("tracks partial progress on a signal that must be repeated", () => {
    const call = makeCall("mayday");
    const { state } = run(call, ["mayday", "mayday", "this", "is"]);
    const index = call.slots.findIndex((s) => s.id === "distress-signal");
    expect(state.slots[index].status).toBe("partial");
    expect(state.slots[index].repeatsMatched).toBe(2);
    expect(statusOf(call, state, "this-is")).toBe("matched");
  });

  it("holds back tokens that may begin a longer phrase", () => {
    const call = makeCall("mayday");
    // "this" alone could still become "this is".
    const result = applyCallTokens(call, createCallMatch(call), ["mayday", "this"]);
    expect(result.state.buffered).toEqual(["this"]);
    expect(result.rejected).toEqual([]);
  });

  it("does not let a half-spoken phrase stall the attempt forever", () => {
    const call = makeCall("mayday");
    const filler = Array.from({ length: 60 }, () => "this");
    const { state } = run(call, filler);
    // Bounded by the longest phrase in the message, not by the input length.
    expect(state.buffered.length).toBeLessThanOrEqual(30);
  });

  it("ignores words that belong to no slot", () => {
    const call = makeCall("mayday");
    const { state, rejected } = run(call, ["mayday", "banana", "mayday", "mayday"]);
    expect(rejected).toContain("banana");
    expect(statusOf(call, state, "distress-signal")).toBe("matched");
  });

  it("counts optional elements out of the score", () => {
    const call = makeCall("mayday");
    const withoutLabel = speakWithout(call, "mmsi-label");
    const { state } = run(call, withoutLabel);
    expect(statusOf(call, state, "mmsi-label")).toBe("missed");
    expect(statusOf(call, state, "mmsi")).toBe("matched");
    expect(scoreCall(call, state).percent).toBe(100);
  });

  it("marks everything still outstanding as missed when stopped early", () => {
    const call = makeCall("mayday");
    const { state } = run(call, ["mayday", "mayday", "mayday"]);
    const finalState = finalizeCallMatch(state);
    expect(finalState.slots.every((s) => s.status !== "pending")).toBe(true);
    expect(statusOf(call, finalState, "over")).toBe("missed");
    expect(scoreCall(call, finalState).percent).toBeGreaterThan(0);
    expect(scoreCall(call, finalState).percent).toBeLessThan(100);
  });

  it("accepts niner in place of nine in the MMSI", () => {
    const call = buildCall(
      "mayday",
      { ...TEST_IDENTITY, mmsi: "211234569" },
      { ...TEST_CONTEXT, natureId: NATURE_OPTIONS.mayday[0].id }
    );
    const tokens = speak(call).map((token) => (token === "nine" ? "niner" : token));
    const { state } = run(call, tokens);
    expect(statusOf(call, state, "mmsi")).toBe("matched");
  });
});
