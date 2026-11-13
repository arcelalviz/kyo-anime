"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Anime, ListStatus, SavedAnime } from "@/lib/types";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { fromRow, toRow, type WatchlistRow } from "@/lib/supabase/watchlist";

const KEY = "kyo:library:v1"; // Keep compatibility with all older KYO/KIROKU versions.
function readGuestList(): SavedAnime[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter((e): e is SavedAnime => Boolean(e && typeof e.id === "string" && typeof e.title === "string" &&
      ["planned", "watching", "completed", "paused", "dropped"].includes(e.status)));
  } catch { return []; }
}

type LibraryContextValue = {
  entries: SavedAnime[];
  ready: boolean;
  busy: boolean;
  cloud: boolean;
  error: string | null;
  guestCount: number;
  add: (anime: Anime, status?: ListStatus) => void;
  remove: (id: string) => void;
  update: (id: string, changes: Partial<Pick<SavedAnime, "status" | "progress">>) => void;
  find: (id: string) => SavedAnime | undefined;
  importGuest: () => Promise<number>;
  refresh: () => Promise<void>;
};
const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const userId = user?.id ?? null;
  const [entries, setEntries] = useState<SavedAnime[]>([]);
  const [ready, setReady] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(0);
  const activeUser = useRef<string | null>(null);
  const entriesRef = useRef<SavedAnime[]>([]);
  // Don't mix an old account's collection into a new account during auth transitions.
  const setLibrary = useCallback((next: SavedAnime[]) => { entriesRef.current = next; setEntries(next); }, []);

  const load = useCallback(async (id: string | null) => {
    const supabase = getSupabaseBrowser();
    if (!id || !supabase) {
      const guest = readGuestList();
      if (activeUser.current === id) { setLibrary(guest); setGuestCount(guest.length); setLoadedFor(id); setReady(true); }
      return;
    }
    const { data, error: fetchError } = await supabase.from("watchlist_entries")
      .select("user_id,anime_id,title,poster,episodes,status,progress,saved_at")
      .eq("user_id", id).order("saved_at", { ascending: false });
    if (activeUser.current !== id) return;
    if (fetchError) { setError(`Couldn't load your cloud collection: ${fetchError.message}`); setReady(false); return; }
    setLibrary((data as WatchlistRow[]).map(fromRow));
    setLoadedFor(id);
    setGuestCount(readGuestList().length);
    setError(null);
    setReady(true);
  }, [setLibrary]);

  useEffect(() => {
    if (!authReady) return;
    activeUser.current = userId;
    setReady(false);
    setLoadedFor(undefined);
    setError(null);
    setLibrary([]);
    void load(userId);
  }, [authReady, userId, load, setLibrary]);

  const persistGuest = (next: SavedAnime[]) => {
    setLibrary(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); setGuestCount(next.length); }
    catch { setError("Browser storage is unavailable. Your changes may not survive a refresh."); }
  };

  const runMutation = (next: SavedAnime[], action: (id: string) => Promise<{ error: { message: string } | null }>) => {
    const previous = entriesRef.current;
    setLibrary(next);
    setError(null);
    if (!userId) { persistGuest(next); return; }
    void action(userId).then(({ error: mutationError }) => {
      if (activeUser.current !== userId) return;
      if (mutationError) { setError(`Couldn't sync your edit: ${mutationError.message}`); setLibrary(previous); }
    }).catch(() => {
      if (activeUser.current === userId) { setError("Couldn't sync. Check your connection and try again."); setLibrary(previous); }
    });
  };

  const add = (anime: Anime, status: ListStatus = "planned") => {
    if (!ready || entriesRef.current.some((entry) => entry.id === anime.id)) return;
    const item: SavedAnime = { id: anime.id, title: anime.title, poster: anime.poster, episodes: anime.episodes,
      status, progress: 0, savedAt: new Date().toISOString() };
    runMutation([item, ...entriesRef.current], async (id) => {
      const supabase = getSupabaseBrowser()!;
      return supabase.from("watchlist_entries").upsert(toRow(id, item), { onConflict: "user_id,anime_id" });
    });
  };
  const remove = (id: string) => {
    if (!ready) return;
    runMutation(entriesRef.current.filter((item) => item.id !== id), async (userId) => {
      const supabase = getSupabaseBrowser()!;
      return supabase.from("watchlist_entries").delete().eq("user_id", userId).eq("anime_id", id);
    });
  };
  const update = (id: string, changes: Partial<Pick<SavedAnime, "status" | "progress">>) => {
    if (!ready) return;
    const target = entriesRef.current.find((item) => item.id === id);
    if (!target) return;
    const updated: SavedAnime = { ...target, ...changes,
      progress: Math.max(0, Math.min(target.episodes ?? 9999, Math.floor(changes.progress ?? target.progress))) };
    runMutation(entriesRef.current.map((item) => item.id === id ? updated : item), async (userId) => {
      const supabase = getSupabaseBrowser()!;
      return supabase.from("watchlist_entries").update({ status: updated.status, progress: updated.progress })
        .eq("user_id", userId).eq("anime_id", id);
    });
  };

  const importGuest = async () => {
    if (!userId || !ready) throw new Error("Sign in before importing your browser library.");
    const guest = readGuestList();
    if (!guest.length) return 0;
    const supabase = getSupabaseBrowser()!;
    setBusy(true);
    try {
      // Existing cloud entries win. No duplicates or overwriting newer progress.
      const rows = guest.map((entry) => toRow(userId, entry));
      const { error: importError } = await supabase.from("watchlist_entries")
        .upsert(rows, { onConflict: "user_id,anime_id", ignoreDuplicates: true });
      if (importError) throw importError;
      await load(userId);
      return guest.length;
    } finally { setBusy(false); }
  };
  const refresh = useCallback(async () => {
    if (authReady) await load(userId);
  }, [authReady, load, userId]);

  // Never expose the previous account’s entries during an auth switch.
  const visibleEntries = loadedFor === userId && authReady ? entries : [];
  const visibleReady = loadedFor === userId && authReady && ready;
  return <LibraryContext.Provider value={{ entries: visibleEntries, ready: visibleReady, busy, cloud: Boolean(userId), error, guestCount,
    add, remove, update, find: (id) => visibleEntries.find((entry) => entry.id === id), importGuest, refresh }}>
    {children}
  </LibraryContext.Provider>;
}

export function useLibrary() {
  const value = useContext(LibraryContext);
  if (!value) throw new Error("useLibrary must be used inside LibraryProvider");
  return value;
}
