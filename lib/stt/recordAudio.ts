// recordAudio.ts
import Recorder from "recorder-js";

let audioContext: AudioContext | null = null;
let recorder: Recorder;

export async function initRecorder() {
  audioContext = new (window.AudioContext)();
  recorder = new Recorder(audioContext);

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recorder.init(stream);
}

export function startRecording() {
  return recorder.start();
}

export async function stopRecording(): Promise<Blob> {
  const { blob } = await recorder.stop();
  return blob; // This is a proper WAV Blob
}
