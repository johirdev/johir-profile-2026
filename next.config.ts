import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/** Long-lived, immutable caching for fingerprinted or never-changing assets. */
const IMMUTABLE = "public, max-age=31536000, immutable";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,

  // Type errors fail the build rather than shipping. (`next build` no longer
  // runs ESLint in v16, so there is no `eslint` key to set — use `npm run lint`.)
  typescript: { ignoreBuildErrors: false },

  // Mongoose is CommonJS with dynamic requires; bundling it into the server
  // build breaks its driver resolution.
  serverExternalPackages: ["mongoose", "bcrypt"],

  images: {
    formats: ["image/avif", "image/webp"],
    // Only hosts this site actually loads images from. The previous list
    // carried leftovers from an unrelated project (mango/recipe sites), each
    // one an open door for arbitrary remote images on our own domain.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      ...(isProd
        ? []
        : [
            {
              protocol: "http" as const,
              hostname: "localhost",
              port: "5000",
              pathname: "/uploads/**",
            },
          ]),
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "react-icons", "framer-motion"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
      {
        // Belt-and-braces with robots.ts: a header Google honours even if the
        // admin area is reached through a link we did not anticipate.
        source: "/admins/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      {
        // Static brand assets — content is stable, so cache them hard.
        source: "/:file(og.png|johir.png|johir-square.png|icon-192.png|icon-512.png|icon-maskable-512.png|Johirul-islam-rasel.png)",
        headers: [{ key: "Cache-Control", value: IMMUTABLE }],
      },
      {
        source: "/Johirul_Islam_CV.pdf",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
          {
            key: "Content-Disposition",
            value: 'attachment; filename="Johirul-Islam-Rasel-CV.pdf"',
          },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Consolidate the old robots/manifest paths onto the route handlers so
      // any existing crawler bookmark still resolves.
      { source: "/manifest.json", destination: "/manifest.webmanifest", permanent: true },
      { source: "/rss.xml", destination: "/feed.xml", permanent: true },
      { source: "/home", destination: "/", permanent: true },
      { source: "/contact", destination: "/start-a-project", permanent: true },
      // /project and /blog have no index page — only /project/[id] and
      // /blog/[id] — so these aliases point at the home-page sections.
      { source: "/projects", destination: "/#projects", permanent: true },
      { source: "/project", destination: "/#projects", permanent: true },
      { source: "/blogs", destination: "/#blog", permanent: true },
      { source: "/blog", destination: "/#blog", permanent: true },
    ];
  },
};

export default nextConfig;
