const nextConfig = {
  async redirects() {
    return [
      {
        source: '/tools/plugins/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: '.+\.vercel\.app' }],
        destination: 'https://mtools.modrinth.black/:path*',
        permanent: true,
      },
    ]
  },
  poweredByHeader: false,
};

module.exports = nextConfig;
