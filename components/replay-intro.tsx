"use client";

import { Play } from "lucide-react";

export function ReplayIntro() {
  function replay() {
    try { sessionStorage.removeItem("kiroku:intro:seen:v3"); } catch { /* optional browser storage */ }
    window.location.reload();
  }
  return <button type="button" className="replay-intro" onClick={replay} title="Replay KIROKU's cinematic opening"><Play size={14} fill="currentColor"/> REPLAY INTRO</button>;
}
