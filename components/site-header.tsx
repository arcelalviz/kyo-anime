"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, CircleDot, LibraryBig, Menu, Search, UserRound, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useLibrary } from "./library-provider";
import { useAuth } from "./auth-provider";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { entries } = useLibrary();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.key === "Escape") { setSearchOpen(false); setMenuOpen(false); }
      if ((event.key === "/" || (event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey))) && !target?.closest("input,textarea,[contenteditable='true']")) {
        event.preventDefault(); setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!searchValue.trim()) return;
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
  }

  return <>
    <header className="site-header">
      <div className="site-container nav-wrap">
        <Link href="/" className="logo" aria-label="KIROKU homepage" onClick={() => setMenuOpen(false)}>
          <span className="logo-symbol" aria-hidden="true"><span/></span>
          <span className="logo-word">KIROKU</span>
          <span className="logo-subtitle">THE ANIME ARCHIVE</span>
        </Link>
        <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`} aria-label="Main navigation">
          <Link href="/" onClick={() => setMenuOpen(false)} className={pathname === "/" ? "active" : ""}>Discover</Link>
          <Link href="/#charts" onClick={() => setMenuOpen(false)}>Top 10</Link>
          <Link href="/search" onClick={() => setMenuOpen(false)} className={pathname === "/search" ? "active" : ""}>Explore</Link>
          <Link href="/library" onClick={() => setMenuOpen(false)} className={pathname === "/library" ? "active" : ""}>My library</Link>
          <Link href={user ? "/account" : "/auth"} onClick={() => setMenuOpen(false)} className={`auth-mobile-link ${pathname === "/account" || pathname === "/auth" ? "active" : ""}`}>{user ? "Account" : "Sign in"}</Link>
          <div className="mobile-nav-note"><CircleDot size={14}/> THE ART OF REMEMBERING</div>
        </nav>
        <div className="nav-actions">
          <button type="button" className="nav-search-trigger" onClick={() => setSearchOpen(true)} aria-label="Open anime search"><Search size={20}/><span>Search anime</span><kbd>/</kbd></button>
          <Link href="/library" className="library-link" aria-label={`My library with ${entries.length} anime`}><LibraryBig size={20}/><span className="library-count">{entries.length}</span></Link>
          <Link className="nav-account-icon" href={user ? "/account" : "/auth"} aria-label={user ? "My account" : "Sign in"} title={user ? "My account" : "Sign in"}><UserRound size={19}/></Link>
          <button type="button" className="icon-button mobile-menu" aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X size={24}/> : <Menu size={24}/>}</button>
        </div>
      </div>
    </header>
    {searchOpen && <div className="search-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSearchOpen(false); }}>
      <div className="search-modal" role="dialog" aria-modal="true" aria-label="Search the anime catalog">
        <div className="search-modal-heading"><span><CircleDot size={16}/> FIND A STORY WORTH KEEPING</span><button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)}><X size={23}/></button></div>
        <form onSubmit={submitSearch} className="search-modal-form"><Search size={26}/><input autoFocus type="search" placeholder="What will you watch next?" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} aria-label="Anime search"/><button type="submit" aria-label="Submit search"><ArrowUpRight size={26}/></button></form>
        <div className="search-modal-tip"><span>DISCOVER SOMETHING UNFORGETTABLE</span><span>ESC TO CLOSE</span></div>
      </div>
    </div>}
  </>;
}
