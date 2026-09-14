/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  async rewrites() {
    return [{ source: '/api-proxy/:path*', destination: 'http://localhost:4000/api/:path*' }];
  },
};
module.exports = nextConfig;
