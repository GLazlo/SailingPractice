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

export async function startAudioSession(
  onFrame: (samples: Float32Array) => void
): Promise<AudioSession> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 }
  });

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
