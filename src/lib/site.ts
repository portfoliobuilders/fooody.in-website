export const SITE = {
  name: "Fooody.in",
  shortName: "Fooody",
  url: "https://fooody.in",
  email: "hello@fooody.in",
  tagline: "Pioneering Kerala Food Tech Since 2016",
  title: "Fooody.in — Order Food Direct in Kochi • ₹0 Platform Fee",
  description:
    "Order from Kochi’s kitchens at real menu prices. ₹0 platform fee, ₹0 surge, no packaging markups. Restaurants: claim your direct store at fooody.in/your-brand — Kerala’s 2016 food-tech pioneer, rebuilt for 2026.",
  keywords: [
    "Fooody Kochi food delivery",
    "zero platform fee food ordering Kerala",
    "order food direct Kochi",
    "claim restaurant URL India",
    "zero commission restaurant ordering",
    "QR code menu ordering",
    "WhatsApp food ordering system",
    "restaurant CRM India",
    "Fooody Kerala",
    "direct ordering for restaurants",
  ],
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Order food" },
  { href: "/our-story/", label: "Our Story" },
  { href: "/for-restaurants/", label: "For Restaurants" },
  { href: "/for-restaurants/#features", label: "Platform" },
  { href: "/for-restaurants/#pricing", label: "Pricing" },
] as const;

export const RESTAURANT_TYPES = [
  "Cafe",
  "QSR",
  "Cloud Kitchen",
  "Full-Service",
  "Bakery",
] as const;

export const KERALA_CITIES = [
  "Kochi",
  "Thiruvananthapuram",
  "Thrissur",
  "Kozhikode",
  "Alappuzha",
  "Kannur",
  "Kollam",
  "Palakkad",
  "Kottayam",
  "Malappuram",
  "Wayanad",
  "Kasaragod",
] as const;

export const WAITLIST_STORAGE_KEY = "fooody_waitlist_v1";
