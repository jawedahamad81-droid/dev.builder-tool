/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@packages/runtime", "@packages/schemas"]
};

module.exports = nextConfig;
