export function formatRating(rating: number | null) {
  return rating === null ? "Not rated" : `${rating}%`;
}
export function formatYear(date: string | null) {
  return date?.slice(0, 4) || "TBA";
}
export function formatStatus(value: string) {
  return value === "current" ? "Airing" : value === "finished" ? "Finished" : value === "upcoming" ? "Upcoming" : value.replace(/_/g, " ");
}
