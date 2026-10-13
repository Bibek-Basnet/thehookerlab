import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* The admin can paste any https image URL, so allow every https host. */
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    /* The site requests quality 85; Next 16 rejects unlisted qualities in production. */
    qualities: [75, 85],
  },
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
