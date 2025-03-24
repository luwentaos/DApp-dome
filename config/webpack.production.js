// 开启JS多线程压缩
const TerserPlugin = require('terser-webpack-plugin');
// 开启CSS多线程压缩
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { resolve, join } = require('path'); // resolve 用于拼接绝对路径，join 用于拼接路径
// HtmlWebpackPlugin 作用是生成一个html文件，自动引入打包后的js文件
const HtmlWebpackPlugin = require('html-webpack-plugin');
// WorkboxPlugin 用于生成 service worker
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  output: {
    path: join(__dirname, '../dist'),
    publicPath: '/',
    filename: 'scripts/[name].[chunkhash:5].bundle.js',
    assetModuleFilename: 'assets/[name].[chunkhash:5][ext]'
  },
  performance: {
    maxAssetSize: 250000, // 限制单个文件大小
    maxEntrypointSize: 250000, // 限制入口文件大小
    hints: 'warning' // 超出限制时只给出警告
  },
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin({
        parallel: true // 开启多线程压缩
      }),
      new TerserPlugin({
        parallel: true
      })
    ]
  },
  plugins: [
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true, // Service Worker 激活后立即控制页面
      skipWaiting: true, // 跳过等待，直接激活新的 Service Worker
      // 预缓存的匹配规则（默认缓存所有 Webpack 输出的文件）
      include: [/\.html$/, /\.js$/, /\.css$/],
      // 可选：添加运行时缓存策略
      runtimeCaching: [
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/, // 匹配图片资源
          handler: 'CacheFirst', // 使用“缓存优先”策略
          options: {
            cacheName: 'images', // 缓存名称
            expiration: {
              maxEntries: 20, // 最多缓存 10 个文件
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30天
            }
          }
        },
        {
          // API 请求缓存策略
          urlPattern: /^https:\/\/api\./, // 匹配字体资源
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 3, // 网络请求超时时间
            expiration: {
              maxEntries: 50, // 最多缓存 10 个文件
              maxAgeSeconds: 5 * 60 // 5分钟
            }
          }
        }
      ]
    }),
    new HtmlWebpackPlugin({
      title: 'Dapp Dome',
      filename: 'index.html',
      // 使用resolve，不使用join，因为join只是简单的拼接字符串，而resolve会判断具体路径。
      template: resolve(__dirname, '../src/index-prod.html'),
      favicon: './public/favicon.ico'
    })
  ]
};
