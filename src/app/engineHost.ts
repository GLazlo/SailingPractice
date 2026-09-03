import type { SpeechEngine } from "../speech/engine";
import { VoskSpeechEngine } from "../speech/voskEngine";

let engine: SpeechEngine | null = null;

/**
 * One engine for the whole app: the speech model is expensive to load, so both
 * practice pages share the same instance.
 */
export function getEngine(): SpeechEngine {
  if (!engine) engine = new VoskSpeechEngine();
  return engine;
}
