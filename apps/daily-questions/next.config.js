const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require('next/constants');

// @ts-expect-error lalala
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {(phase: string, defaultConfig: import("next").NextConfig) => Promise<import("next").NextConfig>} */
module.exports = async (phase) => {
  /**
   * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
   **/
  const nextConfig = {
    experimental: {
      swrDelta: 31536000,
    },
    output: 'standalone',
    nx: {
      // Set this to true if you would like to use SVGR
      // See: https://github.com/gregberge/svgr
      svgr: false,
    },
    webpack: (config, { isServer }) => {
      if (isServer) {
        config.plugins = [...config.plugins, new PrismaPlugin()];
      }

      return config;
    },
  };

  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    const withSerwist = (await import('@serwist/next')).default({
      // Note: This is only an example. If you use Pages Router,
      // use something else that works, such as "service-worker/index.ts".
      swSrc: 'src/app/sw.ts',
      swDest: 'public/sw.js',
    });
    return withBundleAnalyzer(
      withSerwist(composePlugins(...plugins)(nextConfig))
    );
  }

  return composePlugins(...plugins)(nextConfig);
};
