import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This project has its own lockfile; pin the workspace root so Next doesn't
  // infer a parent directory.
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
