import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import type { Anime } from "@/lib/types";
import { formatYear } from "@/lib/format";

export function AnimeCard({ anime, rank, compact = false }: { anime: Anime; rank?: number; compact?: boolean }) {
  return <Link href={`/anime/${anime.id}`} className={`anime-card ${rank ? "is-ranked" : ""} ${compact ? "compact" : ""}`} aria-label={`Discover ${anime.title}`}>
    <div className="anime-poster-area">
      {rank !== undefined && <span className="ranking-digit" aria-hidden="true">{String(rank).padStart(2, "0")}</span>}
      <div className="anime-cover">
        {anime.poster ? <img src={anime.poster} alt="" loading="lazy"/> : <div className="missing-art">KIROKU</div>}
        <div className="card-image-shade"/>
        <span className="card-open" aria-hidden="true"><ArrowUpRight size={20}/></span>
        {anime.rating !== null && <span className="card-score"><Star size={12} fill="currentColor"/> {anime.rating}%</span>}
        <span className="card-bottom-label">DISCOVER THE STORY <ArrowUpRight size={12}/></span>
      </div>
    </div>
    <div className="card-copy"><div className="card-eyebrow"><span>{anime.subtype.toUpperCase()}</span><span>{formatYear(anime.startDate)}</span></div><h3>{anime.title}</h3><p>{anime.episodes ? `${anime.episodes} EPISODES` : "EPISODES TBA"}<span className="card-cta-arrow"><ArrowUpRight size={16}/></span></p></div>
  </Link>;
}
