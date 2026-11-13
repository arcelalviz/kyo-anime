import type { SavedAnime } from "@/lib/types";

export type WatchlistRow = {
  user_id: string;
  anime_id: string;
  title: string;
  poster: string | null;
  episodes: number | null;
  status: SavedAnime["status"];
  progress: number;
  saved_at: string;
};

export function fromRow(row: WatchlistRow): SavedAnime {
  return { id: row.anime_id, title: row.title, poster: row.poster, episodes: row.episodes,
    status: row.status, progress: row.progress, savedAt: row.saved_at };
}
export function toRow(userId: string, entry: SavedAnime): WatchlistRow {
  return { user_id: userId, anime_id: entry.id, title: entry.title,
    poster: entry.poster, episodes: entry.episodes, status: entry.status,
    progress: entry.progress, saved_at: entry.savedAt };
}
