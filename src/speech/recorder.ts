export interface CallRecorder {
  readonly supported: boolean;
  pause(): void;
  resume(): void;
  stop(): Promise<Blob | null>;
}

const NOOP_RECORDER: CallRecorder = {
  supported: false,
  pause() {},
  resume() {},
  async stop() {
    return null;
  }
};

const PREFERRED_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder.isTypeSupported !== "function") return undefined;
  return PREFERRED_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
}

/**
 * Capture the attempt from the same microphone stream the recognizer is using,
 * so the user can play back their own delivery afterwards.
 */
export function startRecording(stream: MediaStream): CallRecorder {
  if (typeof MediaRecorder === "undefined") return NOOP_RECORDER;

  let recorder: MediaRecorder;
  try {
    const mimeType = pickMimeType();
    recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  } catch {
    return NOOP_RECORDER;
  }

  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };
  recorder.start();

  return {
    supported: true,
    pause() {
      if (recorder.state === "recording") recorder.pause();
    },
    resume() {
      if (recorder.state === "paused") recorder.resume();
    },
    stop() {
      return new Promise<Blob | null>((resolve) => {
        if (recorder.state === "inactive") {
          resolve(chunks.length > 0 ? new Blob(chunks, { type: recorder.mimeType }) : null);
          return;
        }
        recorder.onstop = () => {
          resolve(chunks.length > 0 ? new Blob(chunks, { type: recorder.mimeType }) : null);
        };
        recorder.stop();
      });
    }
  };
}
