"use client";

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  className?: string;
}

export default function ProgressBar({ value, label, className = "" }: ProgressBarProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between text-xs text-white/50 mb-1">
          <span>{label}</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
