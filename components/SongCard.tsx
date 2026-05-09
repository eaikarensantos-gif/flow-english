import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { Song } from "@/types";

function formatDuration(seconds?: number | null) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SongCard({ song }: { song: Song }) {
  const tags: string[] = JSON.parse(song.tags || "[]");

  return (
    <div className="group bg-bg-card hover:bg-bg-elevated rounded-xl overflow-hidden border border-white/5 hover:border-accent/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/40">
      {/* Cover */}
      <div className="relative aspect-square bg-bg-elevated overflow-hidden">
        {song.coverUrl ? (
          <Image
            src={song.coverUrl}
            alt={`${song.title} cover`}
            fill
            unoptimized
            referrerPolicy="no-referrer"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="h-16 w-16 text-white/10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {song.duration && (
          <span className="absolute bottom-2 right-2 text-xs text-white/80 bg-black/60 px-1.5 py-0.5 rounded">
            {formatDuration(song.duration)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-white text-sm leading-tight line-clamp-1">{song.title}</h3>
          <Badge level={song.level} className="shrink-0" />
        </div>
        <p className="text-white/50 text-xs mb-3 line-clamp-1">{song.artist} {song.year ? `• ${song.year}` : ""}</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/player/${song.id}`}
          className="block w-full text-center text-xs font-semibold bg-accent text-bg hover:bg-accent-hover py-2 rounded-lg transition-colors"
        >
          Start Learning
        </Link>
      </div>
    </div>
  );
}
