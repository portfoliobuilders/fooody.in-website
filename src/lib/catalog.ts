export const LOCATIONS = [
  {
    id: "kochi",
    label: "Kochi, Kerala",
    hint: "Citywide delivery",
  },
  {
    id: "panampilly",
    label: "Panampilly Nagar",
    hint: "2.1 km · Central Kochi",
  },
  {
    id: "kakkanad",
    label: "Kakkanad",
    hint: "InfoPark & Seaport-Airport",
  },
  {
    id: "fort-kochi",
    label: "Fort Kochi",
    hint: "Heritage quarter",
  },
  {
    id: "mg-road",
    label: "MG Road",
    hint: "Downtown Kochi",
  },
  {
    id: "edappally",
    label: "Edappally",
    hint: "Lulu & north Kochi",
  },
  {
    id: "palarivattom",
    label: "Palarivattom",
    hint: "Puthiya Road & east Kochi",
  },
  {
    id: "vyttila",
    label: "Vyttila",
    hint: "Mobility hub",
  },
] as const;

export type LocationId = (typeof LOCATIONS)[number]["id"];

export const DEFAULT_LOCATION_ID: LocationId = "kochi";

export type CategoryId =
  | "meals"
  | "biryani"
  | "burgers"
  | "grills"
  | "coffee-dessert"
  | "healthy";

export type FilterId =
  | "all"
  | "veg"
  | "fast"
  | "rated"
  | "kerala"
  | "free-delivery";

export type Dish = {
  id: string;
  name: string;
  restaurant: string;
  cuisine: string;
  category: CategoryId;
  price: number;
  aggregatorPrice: number;
  rating: number;
  etaMin: number;
  etaMax: number;
  distanceKm: number;
  veg: boolean;
  keralaClassic: boolean;
  freeDelivery: boolean;
  image: string;
  badge?: string;
};

export const CATEGORIES: {
  id: CategoryId;
  label: string;
  short: string;
  image: string;
}[] = [
  {
    id: "meals",
    label: "Kerala Meals & Curries",
    short: "Kerala Meals",
    image: "/images/menu/meals.jpg",
  },
  {
    id: "biryani",
    label: "Thalassery & Malabar Biryani",
    short: "Biryani",
    image: "/images/menu/biryani.jpg",
  },
  {
    id: "burgers",
    label: "Burgers & Fast Bites",
    short: "Burgers",
    image: "/images/menu/burger.jpg",
  },
  {
    id: "grills",
    label: "Shawarma & Grills",
    short: "Grills",
    image: "/images/menu/shawarma.jpg",
  },
  {
    id: "coffee-dessert",
    label: "Artisan Coffee & Desserts",
    short: "Chai & Sweets",
    image: "/images/menu/coffee.jpg",
  },
  {
    id: "healthy",
    label: "Healthy Bowls & Salads",
    short: "Healthy",
    image: "/images/menu/salad.jpg",
  },
];

export const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "veg", label: "Pure Veg" },
  { id: "fast", label: "Fastest Delivery" },
  { id: "rated", label: "Top Rated (4.5+)" },
  { id: "kerala", label: "Kerala Classics" },
  { id: "free-delivery", label: "₹0 Delivery" },
];

export const DISHES: Dish[] = [
  {
    id: "baketree-zinger",
    name: "Zinger Chicken Sandwich",
    restaurant: "BakeTree Resto Cafe",
    cuisine: "Cafe",
    category: "burgers",
    price: 120,
    aggregatorPrice: 160,
    rating: 4.1,
    etaMin: 18,
    etaMax: 24,
    distanceKm: 3.2,
    veg: false,
    keralaClassic: false,
    freeDelivery: true,
    image: "/images/menu/burger.jpg",
    badge: "Live kitchen",
  },
  {
    id: "baketree-alfaham",
    name: "Al Faham (Full)",
    restaurant: "BakeTree Resto Cafe",
    cuisine: "Arabian",
    category: "grills",
    price: 420,
    aggregatorPrice: 520,
    rating: 4.1,
    etaMin: 28,
    etaMax: 36,
    distanceKm: 3.2,
    veg: false,
    keralaClassic: false,
    freeDelivery: false,
    image: "/images/menu/shawarma.jpg",
  },
  {
    id: "baketree-shawarma",
    name: "Plate Shawarma",
    restaurant: "BakeTree Resto Cafe",
    cuisine: "Arabian",
    category: "grills",
    price: 110,
    aggregatorPrice: 149,
    rating: 4.2,
    etaMin: 16,
    etaMax: 22,
    distanceKm: 3.2,
    veg: false,
    keralaClassic: false,
    freeDelivery: true,
    image: "/images/menu/shawarma.jpg",
    badge: "Direct price",
  },
  {
    id: "baketree-snacksbox",
    name: "Snacks Box",
    restaurant: "BakeTree Resto Cafe",
    cuisine: "Cafe",
    category: "burgers",
    price: 199,
    aggregatorPrice: 259,
    rating: 4.0,
    etaMin: 20,
    etaMax: 26,
    distanceKm: 3.2,
    veg: false,
    keralaClassic: false,
    freeDelivery: true,
    image: "/images/menu/burger.jpg",
  },
  {
    id: "baketree-karikku",
    name: "Karikku Shake",
    restaurant: "BakeTree Resto Cafe",
    cuisine: "Shakes",
    category: "coffee-dessert",
    price: 70,
    aggregatorPrice: 95,
    rating: 4.3,
    etaMin: 12,
    etaMax: 18,
    distanceKm: 3.2,
    veg: true,
    keralaClassic: true,
    freeDelivery: true,
    image: "/images/menu/coffee.jpg",
  },
  {
    id: "thalassery-biryani",
    name: "Thalassery Chicken Biryani",
    restaurant: "Kayal Biryani Co.",
    cuisine: "Malabar",
    category: "biryani",
    price: 249,
    aggregatorPrice: 319,
    rating: 4.8,
    etaMin: 24,
    etaMax: 30,
    distanceKm: 2.1,
    veg: false,
    keralaClassic: true,
    freeDelivery: true,
    image: "/images/menu/biryani.jpg",
    badge: "Direct price",
  },
  {
    id: "mutton-dum",
    name: "Malabar Mutton Dum Biryani",
    restaurant: "Cardamom House",
    cuisine: "Malabar",
    category: "biryani",
    price: 329,
    aggregatorPrice: 409,
    rating: 4.7,
    etaMin: 30,
    etaMax: 38,
    distanceKm: 3.4,
    veg: false,
    keralaClassic: true,
    freeDelivery: false,
    image: "/images/menu/mutton-biryani.jpg",
  },
  {
    id: "beef-porotta",
    name: "Beef Fry & Kerala Porotta",
    restaurant: "Porotta Club",
    cuisine: "Kerala",
    category: "meals",
    price: 240,
    aggregatorPrice: 290,
    rating: 4.6,
    etaMin: 22,
    etaMax: 28,
    distanceKm: 1.6,
    veg: false,
    keralaClassic: true,
    freeDelivery: true,
    image: "/images/menu/porotta.jpg",
    badge: "Kochi favourite",
  },
  {
    id: "fish-meals",
    name: "Karimeen Curry Meals",
    restaurant: "Village Stove",
    cuisine: "Kerala",
    category: "meals",
    price: 219,
    aggregatorPrice: 279,
    rating: 4.5,
    etaMin: 26,
    etaMax: 34,
    distanceKm: 2.8,
    veg: false,
    keralaClassic: true,
    freeDelivery: false,
    image: "/images/menu/meals.jpg",
  },
  {
    id: "puttu-kadala",
    name: "Puttu & Kadala Curry",
    restaurant: "Puttu Lab",
    cuisine: "Kerala",
    category: "meals",
    price: 160,
    aggregatorPrice: 199,
    rating: 4.7,
    etaMin: 18,
    etaMax: 24,
    distanceKm: 1.2,
    veg: true,
    keralaClassic: true,
    freeDelivery: true,
    image: "/images/menu/puttu.jpg",
    badge: "Breakfast star",
  },
  {
    id: "kappa-curry",
    name: "Kappa & Fish Curry",
    restaurant: "Thaal of Kochi",
    cuisine: "Kerala",
    category: "meals",
    price: 199,
    aggregatorPrice: 249,
    rating: 4.4,
    etaMin: 28,
    etaMax: 35,
    distanceKm: 3.1,
    veg: false,
    keralaClassic: true,
    freeDelivery: false,
    image: "/images/menu/curry.jpg",
  },
  {
    id: "smash-burger",
    name: "Cochin Smash Burger",
    restaurant: "Stacked Cochin",
    cuisine: "American",
    category: "burgers",
    price: 279,
    aggregatorPrice: 349,
    rating: 4.6,
    etaMin: 20,
    etaMax: 26,
    distanceKm: 1.9,
    veg: false,
    keralaClassic: false,
    freeDelivery: true,
    image: "/images/menu/smash-burger.jpg",
  },
  {
    id: "butter-burger",
    name: "Butter Chicken Burger",
    restaurant: "Fort Burger Co.",
    cuisine: "Fusion",
    category: "burgers",
    price: 259,
    aggregatorPrice: 329,
    rating: 4.3,
    etaMin: 25,
    etaMax: 32,
    distanceKm: 2.4,
    veg: false,
    keralaClassic: false,
    freeDelivery: false,
    image: "/images/menu/burger.jpg",
  },
  {
    id: "shawarma-platter",
    name: "Chicken Shawarma Platter",
    restaurant: "Al Mina Grills",
    cuisine: "Arabian",
    category: "grills",
    price: 189,
    aggregatorPrice: 249,
    rating: 4.5,
    etaMin: 21,
    etaMax: 27,
    distanceKm: 2.0,
    veg: false,
    keralaClassic: false,
    freeDelivery: true,
    image: "/images/menu/shawarma.jpg",
  },
  {
    id: "mandhi",
    name: "Mixed Grill Mandhi",
    restaurant: "Mandhi & Co.",
    cuisine: "Arabian",
    category: "grills",
    price: 399,
    aggregatorPrice: 499,
    rating: 4.8,
    etaMin: 32,
    etaMax: 40,
    distanceKm: 4.2,
    veg: false,
    keralaClassic: false,
    freeDelivery: false,
    image: "/images/menu/mandhi.jpg",
    badge: "Weekend special",
  },
  {
    id: "beef-kebab",
    name: "Charcoal Beef Kebab Roll",
    restaurant: "Coal & Cardamom",
    cuisine: "Grill",
    category: "grills",
    price: 229,
    aggregatorPrice: 289,
    rating: 4.4,
    etaMin: 23,
    etaMax: 29,
    distanceKm: 2.6,
    veg: false,
    keralaClassic: false,
    freeDelivery: false,
    image: "/images/menu/kebab.jpg",
  },
  {
    id: "pour-over",
    name: "Pour-over & Tres Leches",
    restaurant: "Blackglass Coffee",
    cuisine: "Cafe",
    category: "coffee-dessert",
    price: 220,
    aggregatorPrice: 275,
    rating: 4.7,
    etaMin: 16,
    etaMax: 22,
    distanceKm: 1.1,
    veg: true,
    keralaClassic: false,
    freeDelivery: true,
    image: "/images/menu/coffee.jpg",
  },
  {
    id: "mysore-sundae",
    name: "Mysore Pak Sundae",
    restaurant: "Payasam Atelier",
    cuisine: "Dessert",
    category: "coffee-dessert",
    price: 180,
    aggregatorPrice: 230,
    rating: 4.6,
    etaMin: 19,
    etaMax: 25,
    distanceKm: 1.8,
    veg: true,
    keralaClassic: true,
    freeDelivery: true,
    image: "/images/menu/dessert.jpg",
  },
  {
    id: "sulaimani",
    name: "Sulaimani & Uzhunnu Bonda",
    restaurant: "Chai Kada 2016",
    cuisine: "Chai",
    category: "coffee-dessert",
    price: 90,
    aggregatorPrice: 135,
    rating: 4.5,
    etaMin: 15,
    etaMax: 20,
    distanceKm: 0.9,
    veg: true,
    keralaClassic: true,
    freeDelivery: true,
    image: "/images/menu/chai.jpg",
    badge: "₹0 delivery",
  },
  {
    id: "harvest-bowl",
    name: "Harvest Millet Bowl",
    restaurant: "Green Theory",
    cuisine: "Healthy",
    category: "healthy",
    price: 249,
    aggregatorPrice: 309,
    rating: 4.4,
    etaMin: 22,
    etaMax: 28,
    distanceKm: 2.3,
    veg: true,
    keralaClassic: false,
    freeDelivery: false,
    image: "/images/menu/bowl.jpg",
  },
  {
    id: "grilled-salad",
    name: "Charred Chicken Salad",
    restaurant: "Bowl & Tide",
    cuisine: "Healthy",
    category: "healthy",
    price: 269,
    aggregatorPrice: 339,
    rating: 4.2,
    etaMin: 24,
    etaMax: 30,
    distanceKm: 2.7,
    veg: false,
    keralaClassic: false,
    freeDelivery: true,
    image: "/images/menu/salad.jpg",
  },
];

export const PLATFORM_FEE_PER_ITEM = 8;
export const PACKAGING_MARKUP_PER_ITEM = 12;
export const SEARCH_SUGGESTIONS = [
  "biryani",
  "burgers",
  "cafes",
  "porotta",
  "mandhi",
  "chai",
  "meals",
] as const;

export function getLocation(id: string) {
  return LOCATIONS.find((item) => item.id === id) ?? LOCATIONS[0];
}

export function searchCatalog(query: string) {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];

  const categoryHits = CATEGORIES.filter(
    (category) =>
      category.label.toLowerCase().includes(q) ||
      category.short.toLowerCase().includes(q),
  ).map((category) => ({
    type: "category" as const,
    id: category.id,
    title: category.short,
    subtitle: category.label,
  }));

  const dishHits = DISHES.filter(
    (dish) =>
      dish.name.toLowerCase().includes(q) ||
      dish.restaurant.toLowerCase().includes(q) ||
      dish.cuisine.toLowerCase().includes(q),
  ).map((dish) => ({
    type: "dish" as const,
    id: dish.id,
    title: dish.name,
    subtitle: dish.restaurant,
  }));

  return [...categoryHits, ...dishHits].slice(0, 8);
}

export function filterDishes(
  dishes: Dish[],
  opts: {
    category: CategoryId | "all";
    filter: FilterId;
    query: string;
  },
) {
  const q = opts.query.trim().toLowerCase();
  return dishes.filter((dish) => {
    if (opts.category !== "all" && dish.category !== opts.category) return false;
    if (opts.filter === "veg" && !dish.veg) return false;
    if (opts.filter === "fast" && dish.etaMax > 28) return false;
    if (opts.filter === "rated" && dish.rating < 4.5) return false;
    if (opts.filter === "kerala" && !dish.keralaClassic) return false;
    if (opts.filter === "free-delivery" && !dish.freeDelivery) return false;
    if (
      q &&
      !dish.name.toLowerCase().includes(q) &&
      !dish.restaurant.toLowerCase().includes(q) &&
      !dish.cuisine.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });
}
