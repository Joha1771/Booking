/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.bstatic.com" },
      { protocol: "https", hostname: "q-xx.bstatic.com" },
      { protocol: "https", hostname: "r-xx.bstatic.com" },
      { protocol: "https", hostname: "cf.bstatic.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "flagcdn.com" },
    ],
  },
};
module.exports = nextConfig;
