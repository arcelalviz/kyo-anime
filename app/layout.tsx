import type { Metadata } from "next";
import { LibraryProvider } from "@/components/library-provider";
import { SiteHeader } from "@/components/site-header";
import { ArrowUpRight, CircleDot } from "lucide-react";
import { CinematicIntro } from "@/components/cinematic-intro";
import { AmbientParticles } from "@/components/ambient-particles";
import { PageTransition } from "@/components/page-transition";
import { ScrollReveals } from "@/components/scroll-reveals";
import Link from "next/link";
import { ReplayIntro } from "@/components/replay-intro";
import "./globals.css";
import "./cinematic.css";

export const metadata: Metadata = {
  title: { default: "KIROKU — The Anime Archive", template: "%s | KIROKU" },
  description: "Every story leaves a trace. Discover anime, explore Top 10 rankings, and keep the stories you love in KIROKU.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <LibraryProvider><AmbientParticles/><CinematicIntro/><ScrollReveals/><SiteHeader/><PageTransition><main>{children}</main></PageTransition>
      <footer className="site-footer"><div className="site-container footer-inner">
        <div className="footer-brand"><Link href="/" className="footer-logo">KIROKU</Link><p>Made for the stories that never leave you.</p><span className="footer-orbit"><CircleDot size={15}/> KEEP THE STORIES THAT STAY</span></div>
        <div className="footer-links"><span>EXPLORE</span><Link href="/">Discover <ArrowUpRight size={14}/></Link><Link href="/search">All anime <ArrowUpRight size={14}/></Link><Link href="/library">My collection <ArrowUpRight size={14}/></Link></div>
        <div className="footer-credit"><span>THE FINE PRINT</span><p>Anime metadata is provided through Kitsu. KIROKU is an independent fan-made project and is not affiliated with Kitsu. Artwork belongs to its respective rights holders.</p><small>© {new Date().getFullYear()} KIROKU / BUILT FOR ANIME PEOPLE.</small></div>
      </div><div className="footer-base site-container"><span>ONE UNIVERSE. INFINITE STORIES.</span><ReplayIntro/><span>THE ART OF REMEMBERING</span></div></footer>
    </LibraryProvider>
  </body></html>;
}
