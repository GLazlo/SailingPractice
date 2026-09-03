import { AppStateMachine } from "./stateMachine";
import { applyTokensToSession, createSession, skipCurrentLetter, type Session } from "./session";
import { getEngine } from "./engineHost";
import { buildGrammar, tokenizeTranscript } from "../domain/natoAlphabet";
import { randomWord } from "../domain/words";
import { render, type ViewContext } from "../ui/views";
import type { PageController } from "./pageController";

const WORD_PATTERN = /^[A-Za-z]{1,12}$/;

export function createNatoController(requestPaint: () => void): PageController {
  const machine = new AppStateMachine();
  let session: Session | null = null;
  let partial = "";
  let wordInput = "";
  let wordInputError: string | null = null;
  let modelReady = false;
  let micActive = true;

  machine.subscribe(() => requestPaint());

  function updatePartialText(): void {
    const el = document.querySelector<HTMLElement>(".transcript__partial");
    if (el) el.textContent = partial;
  }

  async function stopEngine(): Promise<void> {
    try {
      await getEngine().stop();
    } catch (err) {
      console.error("Failed to stop speech engine", err);
    }
  }

  async function handleSuccess(word: string): Promise<void> {
    await stopEngine();
    machine.toSuccess(word);
  }

  async function handleStart(): Promise<void> {
    const word = wordInput.trim().toUpperCase();
    if (!WORD_PATTERN.test(word)) {
      wordInputError = "Enter 1-12 letters only (A-Z).";
      requestPaint();
      return;
    }

    try {
      machine.toPreparingModel(0);
      const speech = getEngine();
      await speech.init((pct) => machine.toPreparingModel(pct));
      modelReady = true;

      session = createSession(word);
      partial = "";
      micActive = true;

      speech.onFinalText((text) => {
        if (!session) return;
        const tokens = tokenizeTranscript(text);
        if (tokens.length === 0) return;
        session = applyTokensToSession(session, tokens);
        requestPaint();
        if (session.match.done) void handleSuccess(word);
      });
      speech.onPartial((text) => {
        partial = text;
        updatePartialText();
      });
      speech.onError((err) => machine.toError(err.message));

      await speech.start(buildGrammar());
      machine.toListening(word);
    } catch (err) {
      machine.toError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleStop(): Promise<void> {
    await stopEngine();
    session = null;
    partial = "";
    micActive = true;
    machine.toIdle();
  }

  async function handleMicToggle(): Promise<void> {
    try {
      if (micActive) {
        await getEngine().pause();
        micActive = false;
      } else {
        await getEngine().resume();
        micActive = true;
      }
      requestPaint();
    } catch (err) {
      machine.toError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleReveal(): Promise<void> {
    if (!session) return;
    session = skipCurrentLetter(session);

    if (session.match.done) {
      const match = session.match;
      await stopEngine();
      session = null;
      partial = "";
      machine.toRevealed(match);
    } else {
      requestPaint();
    }
  }

  return {
    render(): string {
      const ctx: ViewContext = {
        state: machine.getState(),
        session,
        partial,
        wordInput,
        wordInputError,
        modelReady,
        micActive
      };
      return render(ctx);
    },

    bindEvents(): void {
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
          requestPaint();
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
          void handleReveal();
        });
        document.getElementById("mic-toggle-btn")?.addEventListener("click", () => {
          void handleMicToggle();
        });
      }

      if (state.kind === "success" || state.kind === "revealed") {
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
    },

    leave(): void {
      const state = machine.getState();
      if (state.kind === "listening" || state.kind === "preparingModel") {
        void stopEngine();
        session = null;
        partial = "";
        machine.toIdle();
      }
    }
  };
}
