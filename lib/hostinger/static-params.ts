export const STATIC_RESTAURANT_IDS = [
  { restaurant_id: "rst_malabar" },
  { restaurant_id: "rst_fortcochin" },
];

export const STATIC_SLUGS = [
  { restaurant_slug: "malabar-kitchen" },
  { restaurant_slug: "fort-cochin-cafe" },
];

export const STATIC_TABLES = ["1", "2", "4", "8", "11", "12"];

export function staticSlugTableParams() {
  return STATIC_SLUGS.flatMap(({ restaurant_slug }) =>
    STATIC_TABLES.map((table_number) => ({ restaurant_slug, table_number })),
  );
}

export function staticQrParams() {
  return STATIC_SLUGS.flatMap(({ restaurant_slug }) =>
    STATIC_TABLES.map((tableNumber) => ({
      restaurantSlug: restaurant_slug,
      tableNumber,
    })),
  );
}
