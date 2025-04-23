import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'pngimg.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: '**.wikimedia.org',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'wildfiresocial.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'freepnglogo.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: '**.logodownload.org',
        port: ''
      },
    ]
  }
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: []
  }
});

export default withMDX(nextConfig);
