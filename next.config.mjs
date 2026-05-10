/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'images.genius.com' },
      { hostname: 'assets.genius.com' },
      { hostname: 't2.genius.com' },
    ],
  },
  // Prevent Next.js from bundling native addons — let Node.js require() them at runtime
  serverExternalPackages: [
    '@libsql/client',
    '@prisma/adapter-libsql',
    '@prisma/adapter-better-sqlite3',
    'better-sqlite3',
  ],
};

export default nextConfig;
