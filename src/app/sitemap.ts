import { MetadataRoute } from "next";
import { createServerClient } from "@/supabase/server";

interface SitemapStar {
  star_name: string;
  updated_at: string;
}

interface SitemapByte {
  id: string;
  title: string;
  updated_at: string;
}

interface SitemapReward {
  id: string;
  title: string;
  updated_at: string;
}

interface SitemapData {
  stars: SitemapStar[];
  bytes: SitemapByte[];
  rewards: SitemapReward[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://starbyte.neploom.com";
  const staticDate = new Date("2025-08-27T00:00:00.000Z").toISOString();

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.rpc("get_sitemap_entries");

    if (error) {
      console.error("Error fetching sitemap entries:", error);
      return getStaticEntries(baseUrl, staticDate);
    }

    if (!data?.success) {
      console.error("RPC failed:", data?.error);
      return getStaticEntries(baseUrl, staticDate);
    }

    const sitemapData: SitemapData = data.data;
    const { stars = [], bytes = [], rewards = [] } = sitemapData;

    const starEntries: MetadataRoute.Sitemap = stars.map(
      (star: SitemapStar) => ({
        url: `${baseUrl}/star/${encodeURIComponent(star.star_name)}`,
        lastModified: new Date(star.updated_at).toISOString(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })
    );

    const bytesEntries: MetadataRoute.Sitemap = bytes.map(
      (byte: SitemapByte) => ({
        url: `${baseUrl}/bytes/${byte.id}`,
        lastModified: new Date(byte.updated_at).toISOString(),
        changeFrequency: "daily" as const,
        priority: 0.7,
      })
    );

    const rewardsEntries: MetadataRoute.Sitemap = rewards.map(
      (reward: SitemapReward) => ({
        url: `${baseUrl}/marketplace/${reward.id}`,
        lastModified: new Date(reward.updated_at).toISOString(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })
    );

    const staticEntries = getStaticEntries(baseUrl, staticDate);

    return [
      ...staticEntries,
      ...starEntries,
      ...bytesEntries,
      ...rewardsEntries,
    ];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return getStaticEntries(baseUrl, staticDate);
  }
}

function getStaticEntries(
  baseUrl: string,
  staticDate: string
): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseUrl}/`,
      lastModified: staticDate,
      changeFrequency: "yearly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/authentication`,
      lastModified: staticDate,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/home`,
      lastModified: staticDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bytes`,
      lastModified: staticDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: staticDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: staticDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: staticDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: staticDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
