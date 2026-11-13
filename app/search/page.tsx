import type { Metadata } from "next";
import { ArrowUpRight, Search, CircleDot } from "lucide-react";
import { AnimeCard } from "@/components/anime-card";
import { searchAnime } from "@/lib/kitsu";

export const metadata: Metadata = { title: "Explore anime" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 80) : "";
  const items = query ? await searchAnime(query) : [];
  return <div className="sub-page shell search-page"><div className="page-intro"><span className="section-kicker">THE WHOLE UNIVERSE / AT YOUR FINGERTIPS</span><h1>EXPLORE <em>ANIME.</em></h1><p>Every favorite started as something you hadn't seen yet.</p></div>
    <form className="explore-search" method="GET" action="/search"><Search size={22}/><input name="q" type="search" autoComplete="off" defaultValue={query} placeholder="Search for a title..." aria-label="Search anime by title" required/><button type="submit">Find it <ArrowUpRight size={17}/></button></form>
    {query ? <div className="search-results"><div className="search-summary"><div><span className="section-kicker">SEARCH RESULTS</span><h2>Looking for “{query}”</h2></div><span>{items.length} RESULTS SHOWN</span></div>{items.length ? <div className="anime-grid">{items.map((item) => <AnimeCard key={item.id} anime={item}/>)}</div> : <div className="empty-state"><span className="empty-symbol"><CircleDot size={32}/></span><h3>No results available</h3><p>Try another title. If searches are failing, the catalog service might be temporarily unavailable.</p></div>}</div> : <div className="search-placeholder"><CircleDot size={28}/><span>YOUR NEXT FAVORITE IS ONE SEARCH AWAY</span><p>Try searching for an anime title you love.</p></div>}
  </div>;
}
