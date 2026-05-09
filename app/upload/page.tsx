"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import ProgressBar from "@/components/ui/ProgressBar";
import { useTranscriptionPoller } from "@/hooks/useTranscriptionPoller";
import { getAudioDuration, trimAudioToSeconds } from "@/lib/audioUtils";

type Step = "idle" | "identifying" | "manual" | "transcribing" | "fetching" | "enriching" | "done" | "error";

const MAX_DURATION_SEC = 600; // 10 minutes
const IDENTIFY_SLICE_SEC = 20;

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [identified, setIdentified] = useState<{ title: string; artist: string } | null>(null);
  const [manualTitle, setManualTitle] = useState("");
  const [manualArtist, setManualArtist] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [enrichProgress, setEnrichProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const transcription = useTranscriptionPoller(step === "transcribing" ? jobId : null);

  // Once transcription completes, move to fetching lyrics
  if (transcription.status === "completed" && step === "transcribing" && identified) {
    handleLyricsAndEnrich(identified.title, identified.artist, transcription);
  }
  if (transcription.status === "error" && step === "transcribing") {
    setStep("error");
    setErrorMsg(transcription.error ?? "Transcription failed");
  }
  if (transcription.status === "timeout" && step === "transcribing") {
    setStep("error");
    setErrorMsg("Transcription timed out. Please try a shorter track.");
  }

  async function handleFile(f: File) {
    setFile(f);
    setObjectUrl(URL.createObjectURL(f));
    try {
      const dur = await getAudioDuration(f);
      setDuration(dur);
      if (dur > MAX_DURATION_SEC) {
        setErrorMsg(`Track is ${Math.round(dur / 60)} minutes. Trimming to 10 minutes for processing.`);
      }
    } catch {
      setDuration(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function startProcessing() {
    if (!file) return;
    setStep("identifying");
    setErrorMsg(null);

    try {
      // Trim to 20s for identification
      let identifyBlob: Blob;
      try {
        identifyBlob = await trimAudioToSeconds(file, IDENTIFY_SLICE_SEC);
      } catch {
        identifyBlob = file.slice(0, 2 * 1024 * 1024); // Fallback: first 2MB
      }

      const idForm = new FormData();
      idForm.append("audio", identifyBlob, "snippet.wav");
      const idRes = await fetch("/api/identify", { method: "POST", body: idForm });
      const idData = await idRes.json();

      if (idData.data?.recognized) {
        setIdentified({ title: idData.data.title, artist: idData.data.artist });
        await startTranscription();
      } else {
        setStep("manual");
      }
    } catch {
      setStep("manual");
    }
  }

  async function startTranscription(title?: string, artist?: string) {
    if (!file) return;
    if (title && artist) setIdentified({ title, artist });
    setStep("transcribing");

    try {
      // Trim to 10 minutes
      let audioBlob: Blob;
      try {
        audioBlob = await trimAudioToSeconds(file, MAX_DURATION_SEC);
      } catch {
        audioBlob = file.slice(0, 4 * 1024 * 1024); // Fallback: first 4MB
      }

      const form = new FormData();
      form.append("audio", audioBlob, "audio.wav");
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = await res.json();

      if (data.ok) {
        if (data.data.jobId === "skip") {
          // No AssemblyAI key — skip transcription, use Genius lyrics only
          const t = title ?? manualTitle;
          const a = artist ?? manualArtist;
          if (t && a) {
            await handleLyricsAndEnrich(t, a, { status: "completed", progress: 100, words: [], text: "", error: null });
          }
        } else {
          setJobId(data.data.jobId);
        }
      } else {
        // Transcription unavailable — try Genius lyrics only
        const t = title ?? manualTitle;
        const a = artist ?? manualArtist;
        if (t && a) {
          await handleLyricsAndEnrich(t, a, { status: "completed", progress: 100, words: [], text: "", error: null });
        } else {
          setStep("error");
          setErrorMsg("Transcription failed. Add ASSEMBLYAI_API_KEY to enable full audio sync.");
        }
      }
    } catch {
      // Network error — try Genius lyrics only
      const t = title ?? manualTitle;
      const a = artist ?? manualArtist;
      if (t && a) {
        await handleLyricsAndEnrich(t, a, { status: "completed", progress: 100, words: [], text: "", error: null });
      } else {
        setStep("error");
        setErrorMsg("Could not reach transcription service. Check your connection.");
      }
    }
  }

  async function handleManualSubmit() {
    if (!manualTitle || !manualArtist) return;
    setIdentified({ title: manualTitle, artist: manualArtist });
    await startTranscription(manualTitle, manualArtist);
  }

  async function handleLyricsAndEnrich(
    title: string,
    artist: string,
    transcriptionResult: typeof transcription
  ) {
    setStep("fetching");

    let lyrics: string[] = [];
    let coverUrl: string | null = null;
    let geniusUrl: string | null = null;

    try {
      const lyricsRes = await fetch(`/api/lyrics?q=${encodeURIComponent(`${title} ${artist}`)}`);
      const lyricsData = await lyricsRes.json();
      if (lyricsData.data?.found) {
        lyrics = lyricsData.data.lyrics;
        coverUrl = lyricsData.data.coverUrl;
        geniusUrl = lyricsData.data.lyricsUrl;
      }
    } catch {
      // Fall back to transcription text
    }

    // If no Genius lyrics, use transcription as lines
    if (!lyrics.length && transcriptionResult.text) {
      lyrics = transcriptionResult.text.split(". ").filter(Boolean);
    }

    // Create song in DB
    const songRes = await fetch("/api/songs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        artist,
        coverUrl,
        geniusUrl,
        duration: duration ? Math.round(duration) : undefined,
        lyrics,
        words: transcriptionResult.words,
      }),
    });
    const songData = await songRes.json();
    const songId = songData.data?.songId;
    if (!songId) {
      setStep("error");
      setErrorMsg("Failed to save song");
      return;
    }

    // Enrich lines with Claude
    setStep("enriching");
    setEnrichProgress(10);

    try {
      const BATCH = 20;
      for (let i = 0; i < lyrics.length; i += BATCH) {
        await fetch("/api/enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines: lyrics.slice(i, i + BATCH), songId }),
        });
        setEnrichProgress(10 + Math.round(((i + BATCH) / lyrics.length) * 90));
      }
    } catch {
      // Non-fatal — player still works
    }

    setStep("done");
    router.push(`/player/${songId}`);
  }

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen px-4 py-12 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Upload a Track</h1>
      <p className="text-white/50 mb-8">Drag and drop or select an audio file to get started.</p>

      {/* File drop zone */}
      {!file && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
            dragging ? "border-accent bg-accent/5" : "border-white/10 hover:border-white/30"
          }`}
        >
          <svg className="h-12 w-12 mx-auto mb-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-white/60 text-sm">Drop your audio file here or <span className="text-accent underline">browse</span></p>
          <p className="text-white/30 text-xs mt-2">MP3, M4A, WAV, OGG supported</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.m4a,.wav,.ogg,audio/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}

      {/* File selected */}
      {file && step === "idle" && (
        <div className="bg-bg-card rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <svg className="h-6 w-6 text-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-white truncate">{file.name}</p>
              {duration && <p className="text-sm text-white/40">{formatTime(duration)}</p>}
            </div>
            <button onClick={() => { setFile(null); setObjectUrl(null); setDuration(null); }} className="ml-auto text-white/30 hover:text-white text-sm">
              Remove
            </button>
          </div>
          {errorMsg && duration && duration > MAX_DURATION_SEC && (
            <p className="text-amber-400 text-sm mb-4 bg-amber-400/10 rounded-lg px-3 py-2">{errorMsg}</p>
          )}
          <button
            onClick={startProcessing}
            className="w-full bg-accent text-bg font-semibold py-3 rounded-xl hover:bg-accent-hover transition-colors"
          >
            Identify & Process
          </button>
        </div>
      )}

      {/* Steps */}
      {step !== "idle" && step !== "manual" && (
        <div className="bg-bg-card rounded-2xl p-6 border border-white/5 space-y-6">
          <StepRow label="Identifying song" done={!["identifying"].includes(step)} active={step === "identifying"} />
          <StepRow label="Transcribing audio" done={["fetching", "enriching", "done"].includes(step)} active={step === "transcribing"} progress={step === "transcribing" ? transcription.progress : undefined} />
          <StepRow label="Fetching lyrics" done={["enriching", "done"].includes(step)} active={step === "fetching"} />
          <StepRow label="Enriching with AI" done={step === "done"} active={step === "enriching"} progress={step === "enriching" ? enrichProgress : undefined} />

          {step === "error" && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-sm">{errorMsg}</p>
              <button onClick={() => { setStep("idle"); setJobId(null); }} className="mt-3 text-xs text-white/60 underline">
                Try again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual identification */}
      {step === "manual" && (
        <div className="bg-bg-card rounded-2xl p-6 border border-white/5">
          <p className="text-white/60 text-sm mb-4">
            Could not identify the song automatically. Enter the details manually:
          </p>
          <input
            type="text"
            placeholder="Song title"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            className="w-full bg-bg-elevated border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm mb-3 outline-none focus:border-accent/50"
          />
          <input
            type="text"
            placeholder="Artist name"
            value={manualArtist}
            onChange={(e) => setManualArtist(e.target.value)}
            className="w-full bg-bg-elevated border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm mb-4 outline-none focus:border-accent/50"
          />
          <button
            onClick={handleManualSubmit}
            disabled={!manualTitle || !manualArtist}
            className="w-full bg-accent text-bg font-semibold py-3 rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

function StepRow({ label, done, active, progress }: { label: string; done: boolean; active: boolean; progress?: number }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-green-500/20 text-green-400" : active ? "bg-accent/20 text-accent" : "bg-white/5 text-white/20"}`}>
        {done ? (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : active ? (
          <Spinner size="sm" />
        ) : (
          <div className="h-2 w-2 rounded-full bg-current" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${done ? "text-green-400" : active ? "text-white" : "text-white/30"}`}>{label}</p>
        {active && progress !== undefined && (
          <ProgressBar value={progress} className="mt-1" />
        )}
      </div>
    </div>
  );
}
