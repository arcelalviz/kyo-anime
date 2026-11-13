"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, CircleDot } from "lucide-react";
import type { Anime } from "@/lib/types";
import { AnimeCard } from "./anime-card";

export function AnimeRail({ title, kicker, items, ranked, id, tagline, index }: {
  title: string; kicker: string; items: Anime[]; ranked?: boolean; id?: string; tagline?: string; index?: string;
}) {
  const list = useRef<HTMLDivElement>(null);
  const scroll = (direction: number) => list.current?.scrollBy({ left: direction * Math.max(280, list.current.clientWidth * .74), behavior: "smooth" });
  return <section className="rail-section" id={id} data-reveal>
    <div className="site-container">
      <div className="section-heading">
        <div><div className="overline section-overline"><span className="section-count">{index || "//"}</span> {kicker}</div><h2>{title}</h2>{tagline && <p>{tagline}</p>}</div>
        <div className="rail-nav"><span className="section-size">{items.length ? `${items.length} TITLES` : "CATALOG UNAVAILABLE"}</span><button type="button" onClick={() => scroll(-1)} disabled={!items.length} aria-label={`Scroll ${title} left`}><ArrowLeft size={19}/></button><button type="button" onClick={() => scroll(1)} disabled={!items.length} aria-label={`Scroll ${title} right`}><ArrowRight size={19}/></button></div>
      </div>
      {items.length ? <div ref={list} className={`anime-rail ${ranked ? "ranked-rail" : ""}`} tabIndex={0} aria-label={`${title} anime carousel`}>
        {items.map((anime, i) => <AnimeCard anime={anime} key={`${id || "rail"}-${anime.id}`} rank={ranked ? i + 1 : undefined}/>)}
      </div> : <div className="feed-error"><span className="feed-error-icon"><CircleDot size={26}/></span><div><strong>The catalog is taking a break.</strong><p>These titles are temporarily unavailable. Try refreshing once the anime service is back online.</p></div><ArrowUpRight size={21}/></div>}
    </div>
  </section>;
}
