interface BadgeProps {
  level: string;
  className?: string;
}

const levelConfig: Record<string, { label: string; className: string }> = {
  beginner: { label: "Beginner", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  intermediate: { label: "Intermediate", className: "bg-accent/20 text-accent border-accent/30" },
  advanced: { label: "Advanced", className: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export default function Badge({ level, className = "" }: BadgeProps) {
  const config = levelConfig[level] ?? { label: level, className: "bg-white/10 text-white/70 border-white/20" };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
