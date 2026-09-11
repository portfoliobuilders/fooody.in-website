export const RESERVED_SLUGS = new Set([
  "fooody",
  "admin",
  "www",
  "app",
  "api",
  "login",
  "support",
  "help",
  "blog",
  "our-story",
  "for-restaurants",
  "privacy",
  "terms",
  "cart",
  "checkout",
  "menu",
]);

export const TAKEN_SLUGS = new Set([
  "paragon",
  "baketree",
  "kfc",
  "mcdonalds",
  "burger-king",
  "dominos",
  "swiggy",
  "zomato",
]);

export type SlugStatus =
  | "empty"
  | "short"
  | "invalid"
  | "reserved"
  | "taken"
  | "available";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function slugStatus(slug: string): SlugStatus {
  if (!slug) return "empty";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return "invalid";
  if (slug.length < 3) return "short";
  if (RESERVED_SLUGS.has(slug)) return "reserved";
  if (TAKEN_SLUGS.has(slug)) return "taken";
  return "available";
}

export const CUISINE_TYPES = [
  "Kerala Classics",
  "Malabar Biryani",
  "Arabian & Mandhi",
  "Cafe & Bakery",
  "Burgers & Fast Bites",
  "Multi-cuisine",
  "Healthy & Bowls",
  "Desserts & Chai",
] as const;
