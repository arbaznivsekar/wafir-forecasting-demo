import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The shops list is the first page now; keep old /shops links working.
  redirects: async () => [{ source: "/shops", destination: "/", permanent: true }],
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
