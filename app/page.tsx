import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, CircleDot, Compass, Play } from "lucide-react";
import { AnimeRail } from "@/components/charts";
import { SpotlightHero } from "@/components/spotlight-hero";
import { getAiring, getChart } from "@/lib/kitsu";

export default async function Home() {
  const [popular, rated, airing] = await Promise.all([getChart("popular"), getChart("rated"), getAiring()]);
  return <>
    <SpotlightHero items={popular}/>
    <div className="manifesto-strip" aria-label="Anime stories worth remembering"><div className="manifesto-track"><span>THE STORIES WE KEEP</span><i/><span>THE WORLDS WE LOVE</span><i/><span>THE MOMENTS THAT STAY</span><i/><span>KIROKU / ANIME ARCHIVE</span><i/><span>THE STORIES WE KEEP</span><i/></div></div>

    <section className="welcome-section site-container" data-reveal><div className="welcome-left"><span className="overline"><CircleDot size={14}/> THE ART OF REMEMBERING</span><h2>MORE THAN ANIME.<br/><em>A STORY TO KEEP.</em></h2></div><div className="welcome-side"><span className="welcome-index">EST. 2026 / ANIME ARCHIVE</span><p>New obsessions. Old favorites. The scenes you never forget. One beautifully crafted space for every story that stays with you.</p></div></section>

    <AnimeRail id="charts" index="01" kicker="RANKED BY POPULARITY ON KITSU" title="THE TOP TEN" tagline="The most popular titles in the archive. Big worlds, lasting impressions." items={popular} ranked/>

    <section className="editorial-panel site-container" data-reveal>
      <div className="editorial-orb orb-left"/><div className="editorial-orb orb-right"/>
      <div className="editorial-copy"><div className="overline"><Compass size={15}/> THE DISCOVERY CONTINUES</div><h2>THERE IS<br/>ALWAYS <em>MORE.</em></h2><p>Somewhere in the archive, your next favorite story is waiting. Go find the one you'll never forget.</p><Link href="/search" className="primary-action">Explore the archive <ArrowUpRight size={19}/></Link><span className="editorial-micro">EVERY STORY LEAVES A TRACE / KIROKU</span></div>
      <div className="editorial-art" aria-hidden="true"><div className="editorial-disc"><div/></div>{popular.slice(1,4).map((anime, index) => anime.poster && <div className={`editorial-art-card editorial-art-${index+1}`} key={anime.id}><img src={anime.poster} alt="" loading="lazy"/></div>)}<span className="editorial-art-label">A DIFFERENT WORLD IS ONE CLICK AWAY</span></div>
    </section>

    <AnimeRail id="rated" index="02" kicker="THE COMMUNITY'S HIGHEST SCORES" title="THE ALL-TIME GREATS" tagline="The stories people return to, ranked by Kitsu's rating chart." items={rated} ranked/>

    <section className="quick-links site-container" data-reveal><div className="quick-links-heading"><span className="overline"><CircleDot size={14}/> YOUR ARCHIVE, YOUR RULES</span><h2>THE GOOD STORIES<br/><em>STAY WITH YOU.</em></h2><p>Go exploring, or build a collection that feels entirely your own.</p></div><Link href="/search" className="quick-link-card"><span className="quick-link-icon"><Compass size={30}/></span><span className="quick-link-label">01 / DISCOVER</span><strong>Find your next<br/>obsession.</strong><ArrowUpRight className="quick-link-arrow" size={27}/></Link><Link href="/library" className="quick-link-card purple-card"><span className="quick-link-icon"><BookOpen size={30}/></span><span className="quick-link-label">02 / REMEMBER</span><strong>Keep every<br/>favorite close.</strong><ArrowUpRight className="quick-link-arrow" size={27}/></Link></section>

    <AnimeRail id="airing" index="03" kicker="STORIES STILL UNFOLDING" title="NOW AIRING" tagline="New episodes and fresh stories for your watchlist." items={airing}/>

    <section className="closing-section site-container" data-reveal><span className="closing-iris" aria-hidden="true"><Play size={24} fill="currentColor"/></span><span className="overline">YOUR NEXT CHAPTER STARTS HERE</span><h2>SOME STORIES<br/><em>NEVER LEAVE.</em></h2><p>Find what moves you. Keep what matters. Your anime archive is ready whenever you are.</p><Link href="/library" className="primary-action">Open my collection <ArrowRight size={19}/></Link><div className="closing-bottom"><span>THE ART OF REMEMBERING</span><span>KIROKU / VOL. 001</span></div></section>
  </>;
}
