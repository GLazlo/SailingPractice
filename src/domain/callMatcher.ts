import { matchPhrase } from "./phrase";
import type { RenderedCall } from "./radioCalls";

export type SlotStatus = "pending" | "partial" | "matched" | "missed";

export interface SlotProgress {
  id: string;
  status: SlotStatus;
  repeatsMatched: number;
}

export interface CallMatchState {
  slots: SlotProgress[];
  pointer: number;
  /** Tokens held back because they may be the start of a longer phrase. */
  buffered: string[];
  done: boolean;
}

export interface CallMatchResult {
  state: CallMatchState;
  rejected: string[];
}

export interface CallScore {
  matched: number;
  total: number;
  percent: number;
}

// How far ahead of the current slot a match is still accepted. A radio message
// is long enough that a strict pointer would stall on the first misrecognition,
// so slots that get passed are marked missed rather than blocking the attempt.
const LOOKAHEAD = 3;

// Slack allowed on top of the longest phrase before buffered tokens are
// discarded, so a half-spoken phrase cannot stall matching for the rest of the
// attempt. It has to exceed the longest phrase — a full position line runs to
// more than twenty words — or the phrase could never complete.
const BUFFER_SLACK = 4;

function maxPhraseLength(call: RenderedCall): number {
  let longest = 0;
  for (const slot of call.slots) {
    let length = 0;
    for (const t of slot.phrase) {
      length += t.length === 0 ? 0 : Math.max(...t.map((seq) => seq.length));
    }
    if (length > longest) longest = length;
  }
  return longest;
}

export function createCallMatch(call: RenderedCall): CallMatchState {
  return {
    slots: call.slots.map((s) => ({ id: s.id, status: "pending", repeatsMatched: 0 })),
    pointer: 0,
    buffered: [],
    done: false
  };
}

export function applyCallTokens(
  call: RenderedCall,
  state: CallMatchState,
  tokens: string[]
): CallMatchResult {
  const slots = state.slots.map((s) => ({ ...s }));
  const rejected: string[] = [];
  const maxBuffered = maxPhraseLength(call) + BUFFER_SLACK;
  let buffer = [...state.buffered, ...tokens];
  let pointer = state.pointer;
  let done = state.done;

  while (buffer.length > 0 && !done) {
    const windowStart = Math.max(0, pointer - 1);
    const windowEnd = Math.min(call.slots.length - 1, pointer + LOOKAHEAD);
    let matchedIndex = -1;
    let consumed = 0;
    let waiting = false;

    for (let i = windowStart; i <= windowEnd; i++) {
      const slot = call.slots[i];
      if (slot.phrase.length === 0) continue;
      // A terminator only counts once every earlier slot is behind us, so a
      // stray "over" mid-message cannot end the attempt.
      if (slot.terminator && i !== pointer) continue;

      const result = matchPhrase(slot.phrase, buffer);
      if (result.kind === "full") {
        matchedIndex = i;
        consumed = result.consumed;
        break;
      }
      if (result.kind === "prefix") waiting = true;
    }

    if (matchedIndex >= 0) {
      for (let i = pointer; i < matchedIndex; i++) {
        if (slots[i].status === "pending") slots[i].status = "missed";
      }

      const progress = slots[matchedIndex];
      const slot = call.slots[matchedIndex];
      progress.repeatsMatched += 1;
      const complete = progress.repeatsMatched >= slot.repeat;
      progress.status = complete ? "matched" : "partial";

      buffer = buffer.slice(consumed);
      pointer = complete ? matchedIndex + 1 : matchedIndex;
      if (slot.terminator && complete) done = true;
      continue;
    }

    if (waiting && buffer.length <= maxBuffered) break;

    rejected.push(buffer[0]);
    buffer = buffer.slice(1);
  }

  return {
    state: { slots, pointer, buffered: done ? [] : buffer, done },
    rejected
  };
}

/** Called when recording stops: everything still outstanding was not said. */
export function finalizeCallMatch(state: CallMatchState): CallMatchState {
  const slots = state.slots.map((s) => ({ ...s }));
  for (let i = 0; i < slots.length; i++) {
    if (slots[i].status === "pending") slots[i].status = "missed";
  }
  return { ...state, slots, buffered: [], done: true };
}

export function scoreCall(call: RenderedCall, state: CallMatchState): CallScore {
  let matched = 0;
  let total = 0;
  for (let i = 0; i < call.slots.length; i++) {
    if (call.slots[i].optional) continue;
    total += 1;
    if (state.slots[i].status === "matched") matched += 1;
  }
  return { matched, total, percent: total === 0 ? 0 : Math.round((matched / total) * 100) };
}

/** Terminators heard before the message was finished. */
export function countEarlyTerminators(rejected: string[]): number {
  return rejected.filter((token) => token === "over" || token === "out").length;
}
