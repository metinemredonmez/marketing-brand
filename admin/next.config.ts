import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Docker prod build için minimal output
  output: process.env.NEXT_OUTPUT_STANDALONE === "true" ? "standalone" : undefined,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "9110" },
      { protocol: "https", hostname: "media.markaradar.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
    // Reverse proxy arkasında non-default port (8443) için Server Actions CSRF
    serverActions: {
      allowedOrigins: [
        "213.159.6.225:8443",
        "213.159.6.225",
        "admin.markaradar.com",
        "markaradar.com",
        "localhost:3014",
        "localhost:8443",
      ],
    },
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
};

export default config;
