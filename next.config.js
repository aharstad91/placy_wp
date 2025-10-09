/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-wordpress-domain.com'], // Replace with your WordPress domain
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  env: {
    WORDPRESS_GRAPHQL_ENDPOINT: process.env.WORDPRESS_GRAPHQL_ENDPOINT,
  },
}

export default nextConfig