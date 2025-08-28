/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pg']
  },
  images: {
    domains: ['cdn.discordapp.com'],
  },
  // Disable webpack cache for edge runtime
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('pg-native');
    }
    return config;
  },
}

module.exports = nextConfig