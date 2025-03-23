// 开启JS多线程压缩
const TerserPlugin = require('terser-webpack-plugin');
// 开启CSS多线程压缩
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { resolve, join } = require('path'); // resolve 用于拼接绝对路径，join 用于拼接路径
// HtmlWebpackPlugin 作用是生成一个html文件，自动引入打包后的js文件
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
    new HtmlWebpackPlugin({
      title: 'Dapp Dome',
      filename: 'index.html',
      // 使用resolve，不使用join，因为join只是简单的拼接字符串，而resolve会判断具体路径。
      template: resolve(__dirname, '../src/index-prod.html'),
      favicon: './public/favicon.ico'
    })
  ]
};
