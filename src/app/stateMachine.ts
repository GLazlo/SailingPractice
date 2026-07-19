import type { MatchState } from "../domain/matcher";

export type AppState =
  | { kind: "idle" }
  | { kind: "preparingModel"; progress: number }
  | { kind: "listening"; word: string }
  | { kind: "success"; word: string }
  | { kind: "revealed"; match: MatchState }
  | { kind: "error"; message: string };

export type Listener = (state: AppState) => void;

export class AppStateMachine {
  private state: AppState = { kind: "idle" };
  private listeners: Listener[] = [];

  getState(): AppState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private set(state: AppState): void {
    this.state = state;
    for (const listener of this.listeners) listener(state);
  }

  toPreparingModel(progress = 0): void {
    this.set({ kind: "preparingModel", progress });
  }

  toListening(word: string): void {
    this.set({ kind: "listening", word });
  }

  toSuccess(word: string): void {
    this.set({ kind: "success", word });
  }

  toRevealed(match: MatchState): void {
    this.set({ kind: "revealed", match });
  }

  toError(message: string): void {
    this.set({ kind: "error", message });
  }

  toIdle(): void {
    this.set({ kind: "idle" });
  }
}
