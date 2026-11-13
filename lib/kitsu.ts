import type { Anime } from "./types";

// Public Kitsu catalog API. For production, confirm Kitsu's terms and image licensing.
// Data requests are made from Next.js servers and cached for 15 minutes.
const API_BASE = "https://kitsu.io/api/edge";

type KitsuAnime = {
  id: string;
  attributes: {
    slug?: string;
    canonicalTitle?: string;
    titles?: { en?: string; en_jp?: string; ja_jp?: string };
    synopsis?: string;
    description?: string;
    posterImage?: { small?: string; medium?: string; large?: string; original?: string } | null;
    coverImage?: { large?: string; original?: string } | null;
    averageRating?: string | null;
    popularityRank?: number | null;
    ratingRank?: number | null;
    episodeCount?: number | null;
    status?: string;
    startDate?: string | null;
    subtype?: string;
    ageRating?: string | null;
  };
};

type ListResponse = { data?: KitsuAnime[] };
type ItemResponse = { data?: KitsuAnime };

function makeUrl(path: string, query?: Record<string, string>) {
  const url = new URL(`${API_BASE}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, value);
  return url.toString();
}

async function fetchKitsu<T>(path: string, query?: Record<string, string>): Promise<T> {
  const response = await fetch(makeUrl(path, query), {
    headers: { Accept: "application/vnd.api+json" },
    next: { revalidate: 900 },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Kitsu API returned ${response.status}`);
  return (await response.json()) as T;
}

function normalize(input: KitsuAnime): Anime {
  const a = input.attributes ?? {};
  const avg = a.averageRating ? Number(a.averageRating) : NaN;
  return {
    id: input.id,
    slug: a.slug ?? input.id,
    title: a.canonicalTitle || a.titles?.en || a.titles?.en_jp || `Anime #${input.id}`,
    titleJapanese: a.titles?.ja_jp ?? null,
    synopsis: (a.synopsis || a.description || "A story waiting to be discovered.").replace(/<[^>]*>/g, ""),
    poster: a.posterImage?.large || a.posterImage?.medium || a.posterImage?.original || null,
    cover: a.coverImage?.original || a.coverImage?.large || null,
    rating: Number.isFinite(avg) ? Math.round(avg * 10) / 10 : null,
    popularityRank: a.popularityRank ?? null,
    ratingRank: a.ratingRank ?? null,
    episodes: a.episodeCount ?? null,
    status: a.status ?? "unknown",
    startDate: a.startDate ?? null,
    subtype: a.subtype ?? "TV",
    ageRating: a.ageRating ?? null,
  };
}

// Defensive safeguard: only known general and teen-appropriate catalog ratings.
// Unrated and mature-rated items are hidden by default in public discovery.
function suitable(item: Anime) {
  return ["G", "PG", "PG-13"].includes((item.ageRating || "").toUpperCase());
}

// Pagination preserves the top-10 layout even when mature or unrated titles are skipped.
// A maximum of four pages limits upstream requests; if Kitsu errors, show any results obtained.
export async function getChart(mode: "popular" | "rated"): Promise<Anime[]> {
  const results: Anime[] = [];
  for (let offset = 0; offset < 80 && results.length < 10; offset += 20) {
    try {
      const response = await fetchKitsu<ListResponse>("/anime", {
        sort: mode === "popular" ? "popularityRank" : "ratingRank",
        "page[limit]": "20",
        "page[offset]": String(offset),
      });
      const page = (response.data ?? []).map(normalize);
      results.push(...page.filter(suitable));
      if (page.length < 20) break;
    } catch (error) {
      console.error(`Kitsu ${mode} chart failed`, error);
      break;
    }
  }
  return results.slice(0, 10);
}

export async function getAiring(): Promise<Anime[]> {
  try {
    const response = await fetchKitsu<ListResponse>("/anime", {
      "filter[status]": "current",
      sort: "-startDate",
      "page[limit]": "20",
    });
    return (response.data ?? []).map(normalize).filter(suitable).slice(0, 12);
  } catch (error) {
    console.error("Kitsu airing feed failed", error);
    return [];
  }
}

export async function searchAnime(query: string): Promise<Anime[]> {
  if (!query.trim()) return [];
  try {
    const response = await fetchKitsu<ListResponse>("/anime", {
      "filter[text]": query.trim().slice(0, 80),
      "page[limit]": "20",
    });
    return (response.data ?? []).map(normalize).filter(suitable);
  } catch (error) {
    console.error("Kitsu search failed", error);
    return [];
  }
}

export async function getAnime(id: string): Promise<Anime | null> {
  if (!/^\d{1,10}$/.test(id)) return null;
  try {
    const response = await fetchKitsu<ItemResponse>(`/anime/${id}`);
    if (!response.data) return null;
    const item = normalize(response.data);
    return suitable(item) ? item : null;
  } catch (error) {
    console.error("Kitsu detail failed", error);
    return null;
  }
}
