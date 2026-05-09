"use client";

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onRateChange: (rate: number) => void;
}

const RATES = [0.5, 0.75, 1.0, 1.25, 1.5];

function formatTime(sec: number) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlayerControls({
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  onPlayPause,
  onSeek,
  onRateChange,
}: PlayerControlsProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-bg-card border-t border-white/5 px-4 py-3 md:py-4 pb-safe">
      {/* Seek bar */}
      <div className="relative h-1 bg-white/10 rounded-full mb-3 group">
        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Time */}
        <span className="text-xs text-white/40 w-20 shrink-0">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          className="h-11 w-11 rounded-full bg-accent text-bg flex items-center justify-center hover:bg-accent-hover transition-colors shrink-0"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Speed */}
        <div className="flex items-center gap-1">
          {RATES.map((r) => (
            <button
              key={r}
              onClick={() => onRateChange(r)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                playbackRate === r ? "bg-accent text-bg" : "text-white/40 hover:text-white"
              }`}
            >
              {r}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
