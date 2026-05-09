"use client";

export async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    });
    audio.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read audio duration"));
    });
  });
}

export async function trimAudioToSeconds(
  file: File,
  maxSeconds: number
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext();

  try {
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);
    const duration = Math.min(decoded.duration, maxSeconds);
    const sampleRate = decoded.sampleRate;
    const numChannels = decoded.numberOfChannels;
    const numSamples = Math.floor(duration * sampleRate);

    const offlineCtx = new OfflineAudioContext(numChannels, numSamples, sampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = decoded;
    source.connect(offlineCtx.destination);
    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();

    // Convert AudioBuffer to WAV blob
    const wavBuffer = audioBufferToWav(renderedBuffer);
    return new Blob([wavBuffer], { type: "audio/wav" });
  } finally {
    await audioCtx.close();
  }
}

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numSamples = buffer.length;
  const byteRate = sampleRate * numChannels * 2;
  const dataSize = numSamples * numChannels * 2;
  const wavBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(wavBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample * 0x7fff, true);
      offset += 2;
    }
  }

  return wavBuffer;
}
