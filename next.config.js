const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({})
const nextConfig = {
  publicRuntimeConfig: {
    NEXT_MAILER: process.env.NEXT_MAILER,
    NEXT_STRAPI_API_URL: process.env.NEXT_STRAPI_API_URL,
    NEXT_STRAPI_BASED_URL: process.env.NEXT_STRAPI_BASED_URL,
    NEXT_FRONT_URL: process.env.NEXT_FRONT_URL,
    NEXT_STRAPI_IMG_DEFAULT: process.env.NEXT_STRAPI_IMG_DEFAULT,
    NEXT_USER_DEFAULT_URL: process.env.NEXT_USER_DEFAULT_URL,
    NEXT_FRONT_HOST: process.env.NEXT_FRONT_HOST
  },
  compress: true,
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['ru', 'en', 'ua'],
    localeDetection: false,
    defaultLocale: 'ru',
  },
  optimization: {
    minimize: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    config.optimization.minimize = true;
    return config;
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**127.0.0.1',
        port: '1337',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: `**${process.env.NEXT_FRONT_HOST}`,
        port: '17818',
        pathname: '/**',
      },
    ],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
