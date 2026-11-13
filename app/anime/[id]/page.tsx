import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, CalendarDays, Clapperboard, Film, Star } from "lucide-react";
import { getAnime } from "@/lib/kitsu";
import { formatStatus, formatYear } from "@/lib/format";
import { WatchButton } from "@/components/watch-button";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const anime = await getAnime(id);
  return { title: anime?.title ?? "Anime unavailable", description: anime?.synopsis.slice(0, 155) };
}

export default async function AnimePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const anime = await getAnime(id);
  if (!anime) return <div className="sub-page shell missing-page"><span className="section-kicker">NOT FOUND / OR CURRENTLY UNAVAILABLE</span><h1>THIS STORY IS<br/><em>OUT OF REACH.</em></h1><p>The title may not be available in the current catalog, or the API may be offline.</p><Link className="btn-primary" href="/search">Back to discovery <ArrowUpRight size={16}/></Link></div>;
  return <>
    <section className="detail-hero">
      {anime.cover && <img className="detail-backdrop" src={anime.cover} alt=""/>}
      <div className="detail-shade"/>
      <div className="shell detail-hero-inner"><Link href="/" className="back-link"><ArrowLeft size={16}/> BACK TO DISCOVERY</Link><div className="detail-body"><div className="detail-poster">{anime.poster ? <img src={anime.poster} alt={`${anime.title} poster`}/> : <div className="missing-art">KIROKU</div>}</div><div className="detail-copy"><span className="section-kicker">ANIME DATABASE / TITLE {anime.id}</span><h1>{anime.title}</h1>{anime.titleJapanese && <p className="original-title">{anime.titleJapanese}</p>}<div className="detail-tags"><span><CalendarDays size={14}/> {formatYear(anime.startDate)}</span><span><Clapperboard size={14}/> {anime.subtype.toUpperCase()}</span><span><Film size={14}/> {anime.episodes ?? "?"} EPISODES</span>{anime.rating !== null && <span className="rating-tag"><Star size={14} fill="currentColor"/> {anime.rating}%</span>}</div><p className="detail-synopsis">{anime.synopsis}</p><div className="detail-actions"><WatchButton anime={anime}/><a className="detail-source" href={`https://kitsu.app/anime/${anime.slug}`} target="_blank" rel="noopener noreferrer">Source on Kitsu <ArrowUpRight size={16}/></a></div></div></div></div>
    </section>
    <section className="shell detail-facts"><div><span>RELEASE</span><strong>{anime.startDate || "Not announced"}</strong></div><div><span>STATUS</span><strong>{formatStatus(anime.status)}</strong></div><div><span>POPULARITY RANK</span><strong>{anime.popularityRank ? `#${anime.popularityRank}` : "Unranked"}</strong></div><div><span>RATING RANK</span><strong>{anime.ratingRank ? `#${anime.ratingRank}` : "Unranked"}</strong></div></section>
    <section className="shell detail-bottom"><span className="section-kicker">THE JOURNEY CONTINUES</span><h2>WHAT WILL YOU<br/><em>WATCH NEXT?</em></h2><Link href="/search" className="btn-primary">Discover more anime <ArrowUpRight size={16}/></Link></section>
  </>;
}
