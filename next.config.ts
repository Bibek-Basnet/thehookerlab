import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* The admin can paste any https image URL, so allow every https host. */
    remotePatterns: [{ protocol: "https", hostname: "**" }],
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
