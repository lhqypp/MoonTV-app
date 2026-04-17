/** @type {import('next').NextConfig} */
/* eslint-disable @typescript-eslint/no-var-requires */

// 判断是否为静态导出（用于打包 APK/App）
const isStaticExport =
  process.env.NEXT_OUTPUT === 'export' ||
  process.env.NEXT_PUBLIC_OUTPUT === 'export' ||
  process.env.CAPACITOR === 'true';

const nextConfig = {
  eslint: {
    dirs: ['src'],
  },

  reactStrictMode: false,
  swcMinify: true,
  
  // 根据环境决定输出模式
  ...(isStaticExport ? {} : { output: 'standalone' }),
  ...(isStaticExport
    ? {
        output: 'export',
        trailingSlash: true,
      }
    : {}),
    
  allowedDevOrigins: ['45.142.166.74'],

  // --- Vercel 反向代理配置 ---
  async rewrites() {
    // 如果是打包 App 模式，不使用代理（App 原生环境支持 HTTP）
    if (isStaticExport) return [];

    return [
      {
        // 这是一个通用的代理规则
        // 以后你在 JSON 里把 http://caiji.dyttzyapi.com/ 换成 /api/proxy/ 即可
        source: '/api/proxy/:path*',
        destination: 'http://caiji.dyttzyapi.com/:path*', 
      },
    ];
  },

  images: {
    unoptimized: true,
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

  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, 
      },
      {
        test: /\.svg$/i,
        issuer: { not: /\.(css|scss|sass)$/ },
        resourceQuery: { not: /url/ }, 
        loader: '@svgr/webpack',
        options: {
          dimensions: false,
          titleProp: true,
        },
      }
    );

    fileLoaderRule.exclude = /\.svg$/i;

    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      crypto: false,
    };

    return config;
  },
};

// PWA 配置
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development' || isStaticExport,
  register: true,
  skipWaiting: true,
});

module.exports = withPWA(nextConfig);