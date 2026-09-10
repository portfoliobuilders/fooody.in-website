import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

const PATHS = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/our-story/", changeFrequency: "monthly" as const, priority: 0.7 },
  {
    path: "/for-restaurants/",
    changeFrequency: "weekly" as const,
    priority: 0.8,
  },
  { path: "/about/", changeFrequency: "yearly" as const, priority: 0.4 },
  { path: "/contact/", changeFrequency: "yearly" as const, priority: 0.4 },
  { path: "/terms/", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/privacy/", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/cookies/", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/disclaimer/", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/refunds/", changeFrequency: "yearly" as const, priority: 0.3 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PATHS.map((item) => ({
    url: `${SITE.url}${item.path}`,
    lastModified: now,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));
}
