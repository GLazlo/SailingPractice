export interface AudioSession {
  audioContext: AudioContext;
  sampleRate: number;
  stream: MediaStream;
  stop(): void;
  pause(): Promise<void>;
  resume(): Promise<void>;
}

const WORKLET_SOURCE = `
class PcmForwarderProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input[0]) {
      this.port.postMessage(input[0].slice(0));
    }
    return true;
  }
}
registerProcessor("pcm-forwarder", PcmForwarderProcessor);
`;

/**
 * getUserMedia rejects with terse names like "Requested device not found",
 * which tell the user nothing about what to do. Translate the common ones.
 */
function describeMicError(err: unknown): Error {
  const name = err instanceof DOMException ? err.name : "";
  switch (name) {
    case "NotFoundError":
    case "OverconstrainedError":
      return new Error(
        "No microphone was found. Connect a microphone and try again. (The in-app browser preview has no microphone — open the app in a normal browser window.)"
      );
    case "NotAllowedError":
    case "SecurityError":
      return new Error(
        "Microphone access was blocked. Allow microphone access for this site in your browser, then try again."
      );
    case "NotReadableError":
      return new Error(
        "The microphone is already in use by another application. Close it and try again."
      );
    default:
      return err instanceof Error ? err : new Error(String(err));
  }
}

export async function startAudioSession(
  onFrame: (samples: Float32Array) => void
): Promise<AudioSession> {
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 }
    });
  } catch (err) {
    throw describeMicError(err);
  }

  const audioContext = new AudioContext();
  const sampleRate = audioContext.sampleRate;
  const source = audioContext.createMediaStreamSource(stream);

  let cleanup: () => void;

  try {
    const blob = new Blob([WORKLET_SOURCE], { type: "application/javascript" });
    const workletUrl = URL.createObjectURL(blob);
    await audioContext.audioWorklet.addModule(workletUrl);
    URL.revokeObjectURL(workletUrl);

    const node = new AudioWorkletNode(audioContext, "pcm-forwarder");
    node.port.onmessage = (event: MessageEvent<Float32Array>) => onFrame(event.data);
    const silentGain = audioContext.createGain();
    silentGain.gain.value = 0;
    source.connect(node);
    node.connect(silentGain);
    silentGain.connect(audioContext.destination);

    cleanup = () => {
      node.port.onmessage = null;
      node.disconnect();
      silentGain.disconnect();
      source.disconnect();
    };
  } catch {
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (event) => {
      onFrame(event.inputBuffer.getChannelData(0).slice());
    };
    source.connect(processor);
    processor.connect(audioContext.destination);

    cleanup = () => {
      processor.onaudioprocess = null;
      processor.disconnect();
      source.disconnect();
    };
  }

  return {
    audioContext,
    sampleRate,
    stream,
    stop() {
      cleanup();
      for (const track of stream.getTracks()) track.stop();
      void audioContext.close();
    },
    async pause() {
      for (const track of stream.getTracks()) track.enabled = false;
      if (audioContext.state === "running") await audioContext.suspend();
    },
    async resume() {
      for (const track of stream.getTracks()) track.enabled = true;
      if (audioContext.state === "suspended") await audioContext.resume();
    }
  };
}
