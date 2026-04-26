import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'insat.rnu.tn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.supcom.tn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.ept.tn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'www.enicarthage.rnu.tn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'enstab.rnu.tn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'enib.rnu.tn',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'www.essai.rnu.tn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fsjpst.rnu.tn',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'www.fsb.rnu.tn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ihec.rnu.tn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'scontent-pmo1-1.xx.fbcdn.net',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'www.isban.rnu.tn',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'www.islt.rnu.tn',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'www.isln.rnu.tn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.mathworks.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
