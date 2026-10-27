import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';
import rspack from '@rspack/core';
import { StorybookPlugin } from '@storybook/react-native/repack/withStorybook';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storybookEnabled = process.env.STORYBOOK_ENABLED === 'true';

/**
 * Rspack configuration enhanced with Re.Pack defaults for React Native.
 *
 * Learn about Rspack configuration: https://rspack.rs/config/
 * Learn about Re.Pack configuration: https://re-pack.dev/docs/guides/configuration
 * Storybook in-app integration: https://storybookjs.github.io/react-native/docs/intro/getting-started/repack/#in-app-integration-storybookplugin
 */
export default Repack.defineRspackConfig({
  context: __dirname,
  entry: './index.js',
  resolve: {
    // enablePackageExports is required for Storybook package resolution
    ...Repack.getResolveOptions({ enablePackageExports: true }),
  },
  module: {
    rules: [
      {
        test: /\.[cm]?[jt]sx?$/,
        type: 'javascript/auto',
        use: {
          loader: '@callstack/repack/babel-swc-loader',
          parallel: true,
          options: {},
        },
      },
      ...Repack.getAssetTransformRules(),
    ],
  },
  plugins: [
    new Repack.RepackPlugin(),
    new rspack.DefinePlugin({
      //STORYBOOK_ENABLED: JSON.stringify(storybookEnabled),
      STORYBOOK_ENABLED: true,
    }),
    new StorybookPlugin({
      //enabled: storybookEnabled,
      enabled: true,
      configPath: path.resolve(__dirname, './.rnstorybook'),
    }),
  ],
});
