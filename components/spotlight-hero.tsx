"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, Play, Star } from "lucide-react";
import { WatchButton } from "./watch-button";
import type { Anime } from "@/lib/types";
import { formatYear } from "@/lib/format";

function shorten(text: string, length = 205) {
  if (text.length <= length) return text;
  return `${text.slice(0, length).replace(/\s+\S*$/, "")}…`;
}

export function SpotlightHero({ items }: { items: Anime[] }) {
  const slides = items.filter((anime) => anime.poster || anime.cover).slice(0, 5);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = slides[active];

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setActive((previous) => (previous + 1) % slides.length);
      }
    }, 8000);
    return () => window.clearInterval(timer);
  }, [slides.length, paused]);

  if (!current) return <section className="spotlight spotlight-empty"><div className="site-container spotlight-empty-content"><span className="overline">THE STORIES THAT STAY WITH US</span><h1>EVERY STORY<br/>LEAVES A <em>TRACE.</em></h1><p>Discover the stories worth remembering. Find, collect, and keep your next favorite anime.</p><Link className="primary-action" href="/search">Enter the archive <ArrowUpRight size={19}/></Link></div></section>;

  const change = (step: number) => setActive((previous) => (previous + step + slides.length) % slides.length);

  return <section className="spotlight" aria-label="Featured anime" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }}>
    <div className="spotlight-visual" key={`art-${current.id}`} aria-hidden="true">
      {(current.cover || current.poster) && <img className="spotlight-backdrop" src={current.cover || current.poster || ""} alt="" fetchPriority="high"/>}
      {current.poster && <div className="spotlight-art-frame"><img className="spotlight-side-poster" src={current.poster} alt="" fetchPriority="high"/><div className="art-frame-caption"><span>KIROKU ARCHIVE</span><span>{String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span></div></div>}
    </div>
    <div className="spotlight-wash" aria-hidden="true"/>
    <div className="hero-frame-line hero-frame-top" aria-hidden="true"/><div className="hero-frame-line hero-frame-bottom" aria-hidden="true"/>
    <div className="site-container spotlight-inner">
      <div className="spotlight-copy" key={`copy-${current.id}`}>
        <span className="overline hero-caption"><span className="signal-dot"/> NOW IN THE SPOTLIGHT <span className="overline-trail">/ CURATED FOR YOUR NEXT WATCH</span></span>
        <h1 className={current.title.length > 105 ? "spotlight-title-very-long" : current.title.length > 65 ? "spotlight-title-long" : "spotlight-title"}>{current.title}</h1>
        <div className="spotlight-meta"><span className="meta-live">FEATURED NO. {String(active + 1).padStart(2, "0")}</span><span>{formatYear(current.startDate)}</span><span>{current.subtype.toUpperCase()}</span>{current.rating !== null && <span><Star size={14} fill="currentColor"/> {current.rating}%</span>}</div>
        <p className="spotlight-description">{shorten(current.synopsis)}</p>
        <div className="spotlight-actions"><Link href={`/anime/${current.id}`} className="primary-action"><Play size={17} fill="currentColor"/> Explore this anime <ArrowUpRight size={19}/></Link><WatchButton anime={current}/></div>
      </div>
      <div className="spotlight-bottom-bar">
        <Link className="hero-scroll" href="#charts">SCROLL TO DISCOVER <ArrowDownRight size={17}/></Link>
        <div className="spotlight-controls"><div className="spotlight-progress"><span className="spotlight-index">{String(active + 1).padStart(2, "0")}</span><span className="progress-track"><span style={{ width: `${((active + 1) / slides.length) * 100}%` }}/></span><span className="progress-total">{String(slides.length).padStart(2, "0")}</span></div><div className="spotlight-arrow-controls"><button type="button" onClick={() => change(-1)} aria-label="Previous featured anime"><ChevronLeft size={20}/></button><button type="button" onClick={() => change(1)} aria-label="Next featured anime"><ChevronRight size={20}/></button></div></div>
      </div>
    </div>
    <span className="spotlight-side-label" aria-hidden="true">THE ART OF REMEMBERING / KIROKU 2026</span>
  </section>;
}
