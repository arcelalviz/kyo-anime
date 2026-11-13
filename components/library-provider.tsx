"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Anime, ListStatus, SavedAnime } from "@/lib/types";

const KEY = "kyo:library:v1";

type LibraryContextValue = {
  entries: SavedAnime[];
  ready: boolean;
  add: (anime: Anime, status?: ListStatus) => void;
  remove: (id: string) => void;
  update: (id: string, changes: Partial<Pick<SavedAnime, "status" | "progress">>) => void;
  find: (id: string) => SavedAnime | undefined;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<SavedAnime[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      if (Array.isArray(saved)) {
        setEntries(saved.filter((e): e is SavedAnime => Boolean(e && typeof e.id === "string" && typeof e.title === "string" && typeof e.status === "string")));
      }
    } catch { /* Recover from malformed browser storage. */ }
    setReady(true);
  }, []);

  const persist = useCallback((next: SavedAnime[]) => {
    setEntries(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Storage may be unavailable. */ }
  }, []);

  const add = (anime: Anime, status: ListStatus = "planned") => {
    if (entries.some((item) => item.id === anime.id)) return;
    persist([{ id: anime.id, title: anime.title, poster: anime.poster, episodes: anime.episodes, status, progress: 0, savedAt: new Date().toISOString() }, ...entries]);
  };
  const remove = (id: string) => persist(entries.filter((item) => item.id !== id));
  const update = (id: string, changes: Partial<Pick<SavedAnime, "status" | "progress">>) => {
    persist(entries.map((item) => item.id === id ? {
      ...item,
      ...changes,
      progress: Math.max(0, Math.min(item.episodes ?? 9999, Math.floor(changes.progress ?? item.progress))),
    } : item));
  };
  const find = (id: string) => entries.find((item) => item.id === id);

  return <LibraryContext.Provider value={{ entries, ready, add, remove, update, find }}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const value = useContext(LibraryContext);
  if (!value) throw new Error("useLibrary must be used inside LibraryProvider");
  return value;
}
