"use client";

import { Check, Plus } from "lucide-react";
import type { Anime } from "@/lib/types";
import { useLibrary } from "./library-provider";

export function WatchButton({ anime, compact = false }: { anime: Anime; compact?: boolean }) {
  const { find, add, remove, ready } = useLibrary();
  const saved = find(anime.id);
  return <button type="button" disabled={!ready} onClick={() => saved ? remove(anime.id) : add(anime)} className={`watch-button ${compact ? "small" : ""} ${saved ? "is-saved" : ""}`} aria-label={saved ? `Remove ${anime.title} from library` : `Add ${anime.title} to library`}>
    {saved ? <Check size={18}/> : <Plus size={18}/>}<span>{saved ? "In your library" : "Add to list"}</span>
  </button>;
}
