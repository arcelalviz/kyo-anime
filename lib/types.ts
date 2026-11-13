export type Anime = {
  id: string;
  slug: string;
  title: string;
  titleJapanese: string | null;
  synopsis: string;
  poster: string | null;
  cover: string | null;
  rating: number | null;
  popularityRank: number | null;
  ratingRank: number | null;
  episodes: number | null;
  status: string;
  startDate: string | null;
  subtype: string;
  ageRating: string | null;
};

export type ListStatus = "planned" | "watching" | "completed" | "paused" | "dropped";

export type SavedAnime = Pick<Anime, "id" | "title" | "poster" | "episodes"> & {
  status: ListStatus;
  progress: number;
  savedAt: string;
};

export const STATUS_OPTIONS: { value: ListStatus; label: string }[] = [
  { value: "planned", label: "Plan to watch" },
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "On hold" },
  { value: "dropped", label: "Dropped" },
];
