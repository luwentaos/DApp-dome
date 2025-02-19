const { resolve } = require('path');
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');
// const ProgressBarPlugin = require('progress-bar-webpack-plugin');
// const WebpackBar = require('WebpackBar');
const { ThemedProgressPlugin } = require('themed-progress-plugin');
const argv = require('yargs-parser')(process.argv.slice(2));
const __mode = argv.mode || 'development';
const __modeflag = __mode === 'production' ? true : false;
const __mergeConfig = require('./config/webpack.' + __mode + '.js');
const webpackBaseConfig = {
  entry: {
    main: resolve('src/index.tsx')
  },
  output: {
    path: resolve(process.cwd(), 'dist')
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /(node_modules)/,
        use: {
          // `.swcrc` can be used to configure swc
          loader: 'swc-loader'
        }
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.css$/i,
        include: [
          resolve(__dirname, 'src'),
          resolve(__dirname, 'node_modules')
        ],
        use: [
          MiniCssExtractPlugin.loader,
          // 'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'postcss-loader'
        ]
      }
    ]
  },
  resolve: {
    alias: {
      '@': resolve('src/'),
      '@components': resolve('src/components'),
      '@hooks': resolve('src/hooks'),
      '@pages': resolve('src/pages'),
      '@layouts': resolve('src/layouts'),
      '@assets': resolve('src/assets'),
      '@states': resolve('src/states'),
      '@service': resolve('src/service'),
      '@utils': resolve('src/utils'),
      '@lib': resolve('src/lib'),
      '@constants': resolve('src/constants'),
      '@connections': resolve('src/connections'),
      '@abis': resolve('src/abis'),
      '@types': resolve('src/types')
    },
    extensions: ['.js', '.ts', '.tsx', '.jsx', '.css'],
    fallback: {
      // stream: require.resolve('stream-browserify'),
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new Dotenv(),
    new MiniCssExtractPlugin({
      filename: __modeflag
        ? 'styles/[name].[contenthash:5].css'
        : 'styles/[name].css',
      chunkFilename: __modeflag
        ? 'styles/[name].[contenthash:5].css'
        : 'styles/[name].css',
      ignoreOrder: false
    }),
    new ThemedProgressPlugin()
  ]
};

module.exports = merge.default(webpackBaseConfig, __mergeConfig);
