"use client";

import { useEffect, useState } from "react";

const INTRO_KEY = "kiroku:intro:seen:v3";

export function CinematicIntro() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(INTRO_KEY) === "yes"; } catch { /* private browsing may block session storage */ }
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const out = window.setTimeout(() => setExiting(true), 2450);
    const done = window.setTimeout(() => {
      setVisible(false);
      try { sessionStorage.setItem(INTRO_KEY, "yes"); } catch { /* storage optional */ }
      document.body.style.overflow = previousOverflow;
    }, 3270);
    return () => {
      window.clearTimeout(out);
      window.clearTimeout(done);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function skip() {
    setExiting(true);
    window.setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
      try { sessionStorage.setItem(INTRO_KEY, "yes"); } catch { /* storage optional */ }
    }, 830);
  }

  if (!visible) return null;
  return <div className={`cinematic-intro ${exiting ? "intro-exiting" : ""}`} role="dialog" aria-modal="true" aria-label="KIROKU opening sequence">
    <div className="intro-noise" aria-hidden="true" />
    <div className="intro-glow" aria-hidden="true" />
    <div className="intro-topline" aria-hidden="true"><span>KIROKU ORIGINAL</span><span>VOL. 001 / A NEW CHAPTER</span></div>
    <div className="intro-core">
      <div className="intro-eyebrow">AN ARCHIVE OF STORIES</div>
      <div className="intro-wordmark" aria-label="Kiroku">KIROKU</div>
      <p>EVERY STORY LEAVES A TRACE.</p>
    </div>
    <div className="intro-bottomline"><span>PRESS PLAY ON A NEW WORLD</span><div className="intro-progress" aria-hidden="true"><span/></div><button type="button" onClick={skip} className="intro-skip">SKIP INTRO <span aria-hidden="true">↗</span></button></div>
    <div className="intro-curtain-left" aria-hidden="true"/><div className="intro-curtain-right" aria-hidden="true"/>
  </div>;
}
