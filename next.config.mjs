/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'images.genius.com' },
      { hostname: 'assets.genius.com' },
      { hostname: 't2.genius.com' },
    ],
  },
};

export default nextConfig;
