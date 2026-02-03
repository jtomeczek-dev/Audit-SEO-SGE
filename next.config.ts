/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NEXT_PUBLIC_IS_DESKTOP === 'true' ? 'export' : undefined,
  // Add images.unoptimized if using 'export' to avoid issues with next/image
  images: {
    unoptimized: process.env.NEXT_PUBLIC_IS_DESKTOP === 'true',
  }
};

export default nextConfig;
