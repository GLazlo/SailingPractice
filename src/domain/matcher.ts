import { lookupLetterByToken } from "./natoAlphabet";

export interface MatchState {
  word: string;
  pointer: number;
  done: boolean;
}

export interface MatchResult {
  state: MatchState;
  advancedBy: number;
  rejected: string[];
}

export function createMatch(word: string): MatchState {
  const normalized = word.toUpperCase();
  return {
    word: normalized,
    pointer: 0,
    done: normalized.length === 0
  };
}

export function applyTranscript(state: MatchState, tokens: string[]): MatchResult {
  let pointer = state.pointer;
  const rejected: string[] = [];
  let advancedBy = 0;

  for (const token of tokens) {
    if (pointer >= state.word.length) break;
    const letter = lookupLetterByToken(token);
    if (letter !== null && letter === state.word[pointer]) {
      pointer += 1;
      advancedBy += 1;
    } else {
      rejected.push(token);
    }
  }

  const nextState: MatchState = {
    word: state.word,
    pointer,
    done: pointer === state.word.length
  };

  return { state: nextState, advancedBy, rejected };
}
