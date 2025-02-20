const { resolve } = require('path');
// webpack-merge 用于合并 webpack 配置文件
const merge = require('webpack-merge');
// MiniCssExtractPlugin 用于将 CSS 提取为独立的文件的插件，对每个包含 css 的 js 文件都会创建一个 css 文件，支持按需加载 css 和 sourceMap
// 如果不提取css，css会以style标签的形式插入到html中。得使用style-loader插件，需要注意的是，style-loader和MiniCssExtractPlugin.loader不能同时使用
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// CleanWebpackPlugin 用于在构建前清理 /dist 文件夹中的内容
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// Dotenv 用于从 .env 文件中加载环境变量
const Dotenv = require('dotenv-webpack');
// ThemedProgressPlugin ProgressBarPlugin WebpackBar 编译时的进度条
// const ProgressBarPlugin = require('progress-bar-webpack-plugin');
// const WebpackBar = require('WebpackBar');
const { ThemedProgressPlugin } = require('themed-progress-plugin');
// yargs-parser 用于解析命令行参数
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
          // 'style-loader', // 将 JS 字符串生成为 style 节点
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
