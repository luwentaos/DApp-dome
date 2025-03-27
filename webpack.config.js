const { resolve } = require('path');
// webpack-merge 用于合并 webpack 配置文件
const merge = require('webpack-merge');
// MiniCssExtractPlugin 用于将 CSS 提取为独立的文件的插件，对每个包含 css 的 js 文件都会创建一个 css 文件，支持按需加载 css 和 sourceMap
// 如果不提取css，css会以style标签的形式插入到html中。得使用style-loader插件，需要注意的是，style-loader和MiniCssExtractPlugin.loader不能同时使用
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// CleanWebpackPlugin 用于在构建前清理 /dist 文件夹中的内容
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// WebpackManifestPlugin 用于生成 manifest.json 文件，这个文件用于映射输出文件和源文件
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
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
  optimization: {
    runtimeChunk: {
      name: 'runtime'
    },
    splitChunks: {
      chunks: 'all',
      // maxInitialRequests: 3, // 解释：表示在入口点处的最大并行请求数。
      // name: true, // 默认是chunk的名字，可以自定义
      // maxAsyncRequests: 3, // 解释：这个属性用于控制异步加载时的最大请求数量。如果某个模块被异步加载的次数超过了3次，那么它会被单独打包，以减少异步加载时的请求数量。
      cacheGroups: {
        commons: {
          chunks: 'all', //表示这个公共模块可以从所有入口点提取。
          name: 'chunk-common', // 指定生成的公共模块的名称。
          minChunks: 2, // 表示被引用次数，默认为1
          maxInitialRequests: 5, // 表示在入口点处的最大并行请求数。
          priority: 1, // 优先级，数字越大，优先级越高
          reuseExistingChunk: true, // 表示是否重用已经存在的公共模块。
          enforce: true // 表示强制提取模块。
        },
        vendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: 2,
          reuseExistingChunk: true,
          enforce: true
        },
        uiComponent: {
          name: 'chunk-component',
          test: /([\\/]node_modules[\\/]@mui[\\/].+\w)|(src[\\/]components[\\/]common)|([\\/]node_modules[\\/]@yideng[\\/]components)/,
          chunks: 'all',
          priority: 4, // 优先级，数字越大，优先级越高
          reuseExistingChunk: true,
          enforce: true
        },
        ethersSDK: {
          name: 'chunk-ethers-sdk',
          test: /[\\/]node_modules[\\/](ethers*\w|@ethersproject*\w|@web3-react*\w)/,
          chunks: 'all',
          priority: 5, // 优先级，数字越大，优先级越高
          reuseExistingChunk: true,
          enforce: true
        },
        reaactLibs: {
          name: 'chunk-react-libs',
          test: /[\\/]node_modules[\\/](react*\w|react-dom*\w|react-router*\w)/,
          chunks: 'all',
          priority: 6, // 优先级，数字越大，优先级越高
          reuseExistingChunk: true,
          enforce: true
        }
      }
    }
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
    new ThemedProgressPlugin(),
    new WebpackManifestPlugin({
      fileName: 'manifest.json'
    })
  ]
};

module.exports = merge.default(webpackBaseConfig, __mergeConfig);
