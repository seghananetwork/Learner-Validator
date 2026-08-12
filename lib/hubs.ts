export const HUBS = [
  { slug: "afritech", name: "Afritech" },
  { slug: "assistance", name: "Assistance" },
  { slug: "dansyn", name: "Dansyn" },
  { slug: "nilf", name: "NILF" },
  { slug: "noni", name: "Noni" },
  { slug: "agrico", name: "Agrico" },
  { slug: "rutab", name: "Rutab" },
  { slug: "ketiwa", name: "Ketiwa" },
  { slug: "wislaw", name: "Wislaw" },
  { slug: "duapa", name: "Duapa" },
  { slug: "nneka", name: "Nneka" },
  { slug: "developers", name: "Developers" },
  { slug: "agritech", name: "AgriTech" },
  { slug: "his-majesty-farms", name: "His Majesty Farms" },
  { slug: "myxbecks", name: "Myxbecks" },
  { slug: "cris", name: "Cris" },
  { slug: "atu", name: "ATU" },
  { slug: "sabon-sake", name: "Sabon Sake" },
] as const;

export type HubSlug = (typeof HUBS)[number]["slug"];

export function hubName(slug: string): string {
  return HUBS.find((h) => h.slug === slug)?.name ?? slug;
}

export function isValidHub(slug: string): boolean {
  return HUBS.some((h) => h.slug === slug);
}
