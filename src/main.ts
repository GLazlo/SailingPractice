import { AppStateMachine } from "./app/stateMachine";
import { createSession, applyTokensToSession, type Session } from "./app/session";
import { randomWord } from "./domain/words";
import { VoskSpeechEngine } from "./speech/voskEngine";
import type { SpeechEngine } from "./speech/engine";
import { render, type ViewContext } from "./ui/views";

const root = document.getElementById("app");
if (!root) throw new Error("Missing #app root element");

const machine = new AppStateMachine();
let engine: SpeechEngine | null = null;
let session: Session | null = null;
let partial = "";
let wordInput = "";
let wordInputError: string | null = null;
let modelReady = false;

const WORD_PATTERN = /^[A-Za-z]{1,12}$/;

function getEngine(): SpeechEngine {
  if (!engine) engine = new VoskSpeechEngine();
  return engine;
}

function paint(): void {
  const ctx: ViewContext = {
    state: machine.getState(),
    session,
    partial,
    wordInput,
    wordInputError,
    modelReady
  };
  root!.innerHTML = render(ctx);
  bindEvents();
}

function bindEvents(): void {
  const state = machine.getState();

  if (state.kind === "idle") {
    const input = document.getElementById("word-input") as HTMLInputElement | null;
    input?.addEventListener("input", () => {
      wordInput = input.value.toUpperCase();
      wordInputError = null;
    });
    document.getElementById("random-word-btn")?.addEventListener("click", () => {
      wordInput = randomWord();
      wordInputError = null;
      paint();
    });
    document.getElementById("start-btn")?.addEventListener("click", () => {
      void handleStart();
    });
  }

  if (state.kind === "listening") {
    document.getElementById("stop-btn")?.addEventListener("click", () => {
      void handleStop();
    });
    document.getElementById("reveal-btn")?.addEventListener("click", () => {
      void handleStop();
    });
  }

  if (state.kind === "success") {
    document.getElementById("continue-btn")?.addEventListener("click", () => {
      session = null;
      wordInput = "";
      machine.toIdle();
    });
  }

  if (state.kind === "error") {
    document.getElementById("retry-btn")?.addEventListener("click", () => {
      machine.toIdle();
    });
  }
}

async function handleStart(): Promise<void> {
  const word = wordInput.trim().toUpperCase();
  if (!WORD_PATTERN.test(word)) {
    wordInputError = "Enter 1-12 letters only (A-Z).";
    paint();
    return;
  }

  try {
    machine.toPreparingModel(0);
    const speech = getEngine();
    await speech.init((pct) => machine.toPreparingModel(pct));
    modelReady = true;

    session = createSession(word);
    partial = "";

    speech.onFinalTokens((tokens) => {
      if (!session) return;
      session = applyTokensToSession(session, tokens);
      paint();
      if (session.match.done) {
        void handleSuccess(word);
      }
    });
    speech.onPartial((text) => {
      partial = text;
      paint();
    });
    speech.onError((err) => {
      machine.toError(err.message);
    });

    await speech.start();
    machine.toListening(word);
  } catch (err) {
    machine.toError(err instanceof Error ? err.message : String(err));
  }
}

async function handleSuccess(word: string): Promise<void> {
  await engine?.stop();
  machine.toSuccess(word);
}

async function handleStop(): Promise<void> {
  await engine?.stop();
  session = null;
  partial = "";
  machine.toIdle();
}

machine.subscribe(() => paint());
