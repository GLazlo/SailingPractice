import type { AppState } from "../app/stateMachine";
import type { Session } from "../app/session";
import { renderLetterTiles } from "./letterTiles";
import { renderTranscript } from "./transcript";
import { getPhoneticLetter } from "../domain/natoAlphabet";

export interface ViewContext {
  state: AppState;
  session: Session | null;
  partial: string;
  wordInput: string;
  wordInputError: string | null;
  modelReady: boolean;
}

export function render(ctx: ViewContext): string {
  switch (ctx.state.kind) {
    case "idle":
      return renderIdle(ctx);
    case "preparingModel":
      return renderPreparingModel(ctx.state.progress);
    case "listening":
      return renderListening(ctx);
    case "success":
      return renderSuccess(ctx.state.word);
    case "error":
      return renderError(ctx.state.message);
  }
}

function renderIdle(ctx: ViewContext): string {
  return `
    <div class="screen screen--idle">
      <h1>NATO Alphabet Practice</h1>
      <p class="badge">${ctx.modelReady ? "Offline model ready" : "Model downloads on first use"}</p>
      <label for="word-input">Type a word</label>
      <input id="word-input" type="text" maxlength="12" autocomplete="off"
        placeholder="e.g. APPLE" value="${ctx.wordInput}" />
      ${ctx.wordInputError ? `<p class="error-text">${ctx.wordInputError}</p>` : ""}
      <div class="button-row">
        <button id="random-word-btn" type="button">Random word</button>
        <button id="start-btn" type="button">Start</button>
      </div>
    </div>
  `;
}

function renderPreparingModel(progress: number): string {
  return `
    <div class="screen screen--loading">
      <h1>Preparing speech model…</h1>
      <p>Downloading the offline recognition model (one-time, ~40&nbsp;MB).</p>
      <progress max="100" value="${progress}"></progress>
      <p>${progress}%</p>
    </div>
  `;
}

function renderListening(ctx: ViewContext): string {
  const match = ctx.session?.match;
  return `
    <div class="screen screen--listening">
      <div class="mic-indicator" aria-hidden="true"></div>
      <div class="tiles">${match ? renderLetterTiles(match) : ""}</div>
      ${renderTranscript(ctx.partial, ctx.session?.rejectedLog ?? [])}
      <div class="button-row">
        <button id="stop-btn" type="button">Stop</button>
        <button id="reveal-btn" type="button">Give up / show answer</button>
      </div>
    </div>
  `;
}

function renderSuccess(word: string): string {
  const spelled = word
    .split("")
    .map((letter) => getPhoneticLetter(letter)?.canonical ?? letter)
    .join(" ");
  return `
    <div class="screen screen--success" aria-live="polite">
      <h1>🎉 Well done!</h1>
      <p class="success-word">${word}</p>
      <p class="success-phonetic">${spelled}</p>
      <button id="continue-btn" type="button">Continue</button>
    </div>
  `;
}

function renderError(message: string): string {
  return `
    <div class="screen screen--error">
      <h1>Something went wrong</h1>
      <p>${message}</p>
      <button id="retry-btn" type="button">Retry</button>
    </div>
  `;
}
