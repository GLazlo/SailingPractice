import { applyTranscript, createMatch, type MatchState } from "../domain/matcher";

export interface Session {
  match: MatchState;
  rejectedLog: string[];
}

export function createSession(word: string): Session {
  return { match: createMatch(word), rejectedLog: [] };
}

export function applyTokensToSession(session: Session, tokens: string[]): Session {
  const result = applyTranscript(session.match, tokens);
  return {
    match: result.state,
    rejectedLog: [...session.rejectedLog, ...result.rejected].slice(-10)
  };
}
