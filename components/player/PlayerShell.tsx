"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import PlayerControls from "./PlayerControls";
import ModeSelector from "./ModeSelector";
import SyncMode from "./modes/SyncMode";
import TranslateMode from "./modes/TranslateMode";
import FillBlankMode from "./modes/FillBlankMode";
import WordTapMode from "./modes/WordTapMode";
import { useAudioSync } from "@/hooks/useAudioSync";
import type { PlaybackMode, LyricsLine, WordEnrichment, Song } from "@/types";

interface PlayerShellProps {
  song: Song;
  lines: LyricsLine[];
  enrichments: WordEnrichment[];
  audioUrl?: string | null; // objectURL from upload, null for demo songs
}

// Verified Spotify track IDs for demo songs
const SPOTIFY_IDS: Record<string, string> = {
  "humble-kdot":  "7KXjTSCq5nL1LoYtL7XAwS",
  "alright-kdot": "3iVcZ5G6tvkXZkZKlMpIUs",
  "empire-jz":    "2igwFfvr1OAGX9SKDCPBwO",
  "ny-state-nas": "0IlM7NOK43Mx94NLWsCG18",
};

export default function PlayerShell({ song, lines, enrichments, audioUrl }: PlayerShellProps) {
  const spotifyId = SPOTIFY_IDS[song.id] ?? song.spotifyId ?? null;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [mode, setMode] = useState<PlaybackMode>("sync");
  const rafRef = useRef<number | null>(null);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(audioUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setLocalAudioUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const currentTimeMs = currentTime * 1000;
  const activeIndex = useAudioSync(lines, currentTimeMs);

  // RAF-based time update
  useEffect(() => {
    const tick = () => {
      if (audioRef.current && !audioRef.current.paused) {
        setCurrentTime(audioRef.current.currentTime);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleSeek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time / 1000; // ms → seconds
    setCurrentTime(time / 1000);
  }, []);

  const handleSeekSec = useCallback((sec: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = sec;
    setCurrentTime(sec);
  }, []);

  const handleRateChange = useCallback((rate: number) => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-56px)]">
      {/* Sidebar: song info + controls */}
      <div className="w-full md:w-72 shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-white/5 bg-bg-card">
        {/* Album art */}
        <div className="relative aspect-square bg-bg-elevated overflow-hidden">
          {song.coverUrl ? (
            <Image src={song.coverUrl} alt={song.title} fill unoptimized referrerPolicy="no-referrer" className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="h-24 w-24 text-white/10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          )}
        </div>

        {/* Song info */}
        <div className="px-4 pt-4 pb-2">
          <h1 className="font-bold text-white text-lg leading-tight">{song.title}</h1>
          <p className="text-white/50 text-sm">{song.artist}</p>
          {song.album && <p className="text-white/30 text-xs mt-0.5">{song.album} {song.year ? `• ${song.year}` : ""}</p>}

          {/* Audio: Spotify embed or local file picker */}
          {spotifyId && !localAudioUrl ? (
            <div className="mt-3">
              <iframe
                src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full text-xs text-white/30 hover:text-white/60 transition-colors text-center"
              >
                or load local file for sync mode ↑
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 w-full flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/30 text-white/50 hover:text-white rounded-lg px-3 py-2 transition-all"
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              {localAudioUrl ? "Change audio file" : "Load audio file to play"}
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleLocalFile} />

          {/* Quiz link */}
          <Link
            href={`/quiz/${song.id}`}
            className="mt-3 flex items-center gap-2 text-xs text-white/50 hover:text-accent transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Take the quiz
          </Link>
        </div>

        {/* Audio element */}
        {localAudioUrl && (
          <audio
            ref={audioRef}
            src={localAudioUrl}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}

        {/* Player controls */}
        <div className="mt-auto">
          <PlayerControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            playbackRate={playbackRate}
            onPlayPause={handlePlayPause}
            onSeek={handleSeekSec}
            onRateChange={handleRateChange}
          />
        </div>
      </div>

      {/* Main: mode selector + lyrics */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mode tabs */}
        <div className="px-4 py-3 border-b border-white/5 shrink-0">
          <ModeSelector mode={mode} onChange={setMode} />
        </div>

        {/* Lyrics area */}
        <div className="flex-1 overflow-hidden p-4">
          {lines.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/20 text-center">
              <div>
                <p className="text-lg font-medium mb-2">No lyrics available</p>
                <p className="text-sm">Upload your own audio to transcribe lyrics.</p>
              </div>
            </div>
          ) : mode === "sync" ? (
            <SyncMode lines={lines} activeIndex={activeIndex} onSeek={handleSeek} />
          ) : mode === "translate" ? (
            <TranslateMode lines={lines} activeIndex={activeIndex} onSeek={handleSeek} />
          ) : mode === "fill" ? (
            <FillBlankMode lines={lines} enrichments={enrichments} activeIndex={activeIndex} onSeek={handleSeek} />
          ) : (
            <WordTapMode lines={lines} enrichments={enrichments} activeIndex={activeIndex} onSeek={handleSeek} songTitle={song.title} />
          )}
        </div>
      </div>
    </div>
  );
}
