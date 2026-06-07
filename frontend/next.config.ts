/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  devIndicators: {
    buildActivity: false, 
  },
};

export default nextConfig;