"use client";

import { useRouter, useSearchParams } from "next/navigation";

const levels = [
  { value: "", label: "All" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeLevel = searchParams.get("level") ?? "";

  function setLevel(level: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (level) {
      params.set("level", level);
    } else {
      params.delete("level");
    }
    router.replace(`/?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-white/40 text-sm mr-1">Filter:</span>
      {levels.map((lvl) => (
        <button
          key={lvl.value}
          onClick={() => setLevel(lvl.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeLevel === lvl.value
              ? "bg-accent text-bg"
              : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          }`}
        >
          {lvl.label}
        </button>
      ))}
    </div>
  );
}
