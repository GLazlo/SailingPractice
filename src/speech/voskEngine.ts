import type { SpeechEngine } from "./engine";
import { getModelUrl } from "./modelStore";
import { buildGrammar } from "../domain/natoAlphabet";
import { startAudioSession, type AudioSession } from "./audio";

interface VoskModel {
  KaldiRecognizer: new (sampleRate: number, grammar: string) => VoskRecognizer;
  terminate(): void;
}

interface VoskRecognizerEvent {
  result?: { text: string };
  partial?: string;
}

interface VoskRecognizer {
  on(event: "result" | "partialresult", cb: (message: VoskRecognizerEvent) => void): void;
  acceptWaveform(buffer: AudioBuffer): void;
  remove(): void;
}

export class VoskSpeechEngine implements SpeechEngine {
  private model: VoskModel | null = null;
  private recognizer: VoskRecognizer | null = null;
  private audioSession: AudioSession | null = null;
  private finalCb: ((tokens: string[]) => void) | null = null;
  private partialCb: ((text: string) => void) | null = null;
  private errorCb: ((err: Error) => void) | null = null;

  async init(onProgress?: (pct: number) => void): Promise<void> {
    const [modelUrl, { createModel }] = await Promise.all([
      getModelUrl(onProgress),
      import("vosk-browser")
    ]);
    this.model = (await createModel(modelUrl)) as unknown as VoskModel;
  }

  async start(): Promise<void> {
    if (!this.model) throw new Error("Speech engine not initialized");

    this.audioSession = await startAudioSession((samples) => {
      if (!this.recognizer || !this.audioSession) return;
      const buffer = this.audioSession.audioContext.createBuffer(
        1,
        samples.length,
        this.audioSession.sampleRate
      );
      buffer.copyToChannel(samples as Float32Array<ArrayBuffer>, 0);
      try {
        this.recognizer.acceptWaveform(buffer);
      } catch (err) {
        this.errorCb?.(err instanceof Error ? err : new Error(String(err)));
      }
    });

    this.recognizer = new this.model.KaldiRecognizer(
      this.audioSession.sampleRate,
      JSON.stringify(buildGrammar())
    );

    this.recognizer.on("result", (message) => {
      const text = message.result?.text ?? "";
      const tokens = text
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0 && t !== "[unk]");
      if (tokens.length > 0) this.finalCb?.(tokens);
    });

    this.recognizer.on("partialresult", (message) => {
      this.partialCb?.(message.partial ?? "");
    });
  }

  async stop(): Promise<void> {
    this.audioSession?.stop();
    this.audioSession = null;
    this.recognizer?.remove();
    this.recognizer = null;
  }

  async pause(): Promise<void> {
    await this.audioSession?.pause();
  }

  async resume(): Promise<void> {
    await this.audioSession?.resume();
  }

  onFinalTokens(cb: (tokens: string[]) => void): void {
    this.finalCb = cb;
  }

  onPartial(cb: (text: string) => void): void {
    this.partialCb = cb;
  }

  onError(cb: (err: Error) => void): void {
    this.errorCb = cb;
  }
}
