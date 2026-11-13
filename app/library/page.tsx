"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, Check, ChevronDown, Minus, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { STATUS_OPTIONS, type ListStatus } from "@/lib/types";
import { useLibrary } from "@/components/library-provider";

export default function LibraryPage() {
  const { entries, remove, update, ready } = useLibrary();
  const [filter, setFilter] = useState<ListStatus | "all">("all");
  const visible = useMemo(() => entries.filter((item) => filter === "all" || item.status === filter), [entries, filter]);
  const completed = entries.filter((item) => item.status === "completed").length;
  const watching = entries.filter((item) => item.status === "watching").length;

  return <div className="shell sub-page library-page"><div className="page-intro"><span className="section-kicker">YOUR SPACE / YOUR STORIES</span><h1>MY <em>COLLECTION.</em></h1><p>All the worlds you've visited and the ones waiting for you.</p></div>
    <div className="library-stats"><div><span>TOTAL TITLES</span><strong>{ready ? entries.length.toString().padStart(2, "0") : "--"}</strong></div><div><span>CURRENTLY WATCHING</span><strong>{ready ? watching.toString().padStart(2, "0") : "--"}</strong></div><div><span>COMPLETED</span><strong>{ready ? completed.toString().padStart(2, "0") : "--"}</strong></div><div className="library-stats-deco" aria-hidden="true">記録</div></div>
    <div className="library-filter"><div className="filter-tabs"><button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>All <span>{entries.length}</span></button>{STATUS_OPTIONS.map((option) => <button className={filter === option.value ? "selected" : ""} key={option.value} onClick={() => setFilter(option.value)}>{option.label} <span>{entries.filter((e) => e.status === option.value).length}</span></button>)}</div></div>
    {!ready ? <p className="library-loading">Loading your collection...</p> : visible.length ? <div className="library-items">{visible.map((anime) => <article className="library-item" key={anime.id}><Link className="library-item-cover" href={`/anime/${anime.id}`}>{anime.poster ? <img src={anime.poster} alt=""/> : <span>KIROKU</span>}</Link><div className="library-item-copy"><span className="section-kicker">IN YOUR COLLECTION</span><Link href={`/anime/${anime.id}`}><h3>{anime.title}</h3></Link><p>{anime.episodes ? `${anime.episodes} episodes` : "Episode count not listed"}</p></div><div className="library-item-controls"><label className="status-select-wrap"><span>STATUS</span><select value={anime.status} onChange={(e) => update(anime.id, { status: e.target.value as ListStatus })} aria-label={`Status for ${anime.title}`}>{STATUS_OPTIONS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select><ChevronDown size={14}/></label><div className="progress-wrap"><span>EPISODES WATCHED</span><div><button onClick={() => update(anime.id, { progress: anime.progress - 1 })} aria-label={`Decrease watched episodes for ${anime.title}`} disabled={anime.progress <= 0}><Minus size={15}/></button><strong>{anime.progress} <span>/ {anime.episodes ?? "?"}</span></strong><button onClick={() => update(anime.id, { progress: anime.progress + 1 })} aria-label={`Increase watched episodes for ${anime.title}`} disabled={anime.episodes !== null && anime.progress >= anime.episodes}><Plus size={15}/></button></div></div></div><button className="remove-item" onClick={() => remove(anime.id)} title="Remove from collection" aria-label={`Remove ${anime.title}`}><Trash2 size={18}/></button></article>)}</div> : <div className="empty-state"><div className="empty-symbol"><BookOpen size={35}/></div><h3>{entries.length ? "Nothing in this category" : "Your collection starts here."}</h3><p>{entries.length ? "Try another collection filter." : "Find a story you love, then add it to your list. This starter saves your collection in this browser."}</p><Link className="btn-primary" href="/search">Find your next anime <ArrowUpRight size={17}/></Link></div>}
    <p className="storage-note">Collection data is saved to this browser only in this starter. Account-based, cross-device syncing is planned for a later release.</p>
  </div>;
}
