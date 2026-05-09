import SongCard from "@/components/SongCard";
import type { Song } from "@/types";

export default function SongGrid({ songs }: { songs: Song[] }) {
  if (songs.length === 0) {
    return (
      <div className="text-center py-24 text-white/30">
        <svg className="h-16 w-16 mx-auto mb-4 opacity-30" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
        <p className="text-lg font-medium">No songs found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {songs.map((song) => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  );
}
