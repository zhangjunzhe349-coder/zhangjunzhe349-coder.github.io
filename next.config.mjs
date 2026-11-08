/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // GitHub Pages 直接按目录索引取页：/all/ → /all/index.html
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
