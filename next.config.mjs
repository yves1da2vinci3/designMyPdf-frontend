import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer({
  output: 'standalone',

  // Paquets avec condition `module-sync` → require.mjs : le trace NFT ne les copie pas toujours en standalone.
  // Clé `/api/**/*` (pas `/**`) : un glob trop large peut corrompre le traçage (chunks manquants au build).
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': [
        './node_modules/async-function/**/*',
        './node_modules/async-generator-function/**/*',
        './node_modules/generator-function/**/*',
      ],
    },
  },

  reactStrictMode: false,

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
  },

  transpilePackages: ['monaco-editor', 'monaco-tailwindcss', 'emmet-monaco-es'],
});
