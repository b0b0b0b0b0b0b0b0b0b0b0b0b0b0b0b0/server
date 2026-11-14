const nextConfig = {
  async redirects() {
    return [
      {
        source: '/tools/ping',
        has: [{ type: 'query', key: 's', value: '(?<server>[^/]+)/?' }],
        destination: '/tools/ping/:server',
        permanent: false,
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
