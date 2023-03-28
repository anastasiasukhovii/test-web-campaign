/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  swcMinify: false,
  images: {
    domains: [
      'updootfanf2bc5d5db8a14c41b38fbd6dc6e11b48143630-dev.s3.ap-northeast-2.amazonaws.com',
    ],
  },
  i18n: {
    locales: ['en', 'ko'],
    defaultLocale: 'en',
    localeDetection: false,
  },
};

module.exports = nextConfig;
