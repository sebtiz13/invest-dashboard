import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Suppress issues from supabase directory (Deno-specific code)
    ignoreIssue: [
      { path: '**/supabase/**' },
    ],
  },
};

export default nextConfig;
