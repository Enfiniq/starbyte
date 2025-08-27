import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/authentication",
          "/home",
          "/bytes",
          "/bytes/*",
          "/leaderboard",
          "/marketplace",
          "/marketplace/*",
          "/profile",
          "/star/*"
        ],
        disallow: ["/admin"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
  };
}
