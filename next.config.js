const nextConfig = {
  async redirects() {
    return [
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
