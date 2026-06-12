/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  },
  images: { unoptimized: true, domains: ["localhost"] },
};
module.exports = nextConfig;
