// HtmlWebpackPlugin 作用是生成一个html文件，自动引入打包后的js文件
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { resolve, join } = require('path');
// FriendlyErrorsWebpackPlugin 用于更友好地输出webpack的警告和错误信息
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');
// node-notifier 用于在系统通知中显示 FriendlyErrorsWebpackPlugin 插件的错误信息
const notifier = require('node-notifier');
// webpack-bundle-analyzer 用于分析webpack
const bundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const port = 3003;

module.exports = {
  devServer: {
    historyApiFallback: true,
    static: {
      directory: join(__dirname, '../dist')
    },
    hot: true,
    port
  },
  stats: 'errors-only',
  output: {
    publicPath: '/',
    // 如果是通过loader 编译的 放到scripts文件夹里 filename
    filename: 'scripts/[name].bundle.js',
    // 如果是通过'asset/resource' 编译的
    assetModuleFilename: 'images/[name].[ext]'
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      favicon: './public/favicon.ico',
      template: resolve(__dirname, '../src/index-dev.html')
    }),
    new FriendlyErrorsWebpackPlugin({
      compilationSuccessInfo: {
        messages: ['You application is running here http://localhost:' + port],
        notes: ['💊 构建信息请及时关注窗口右上角']
      },

      onErrors: function (severity, errors) {
        if (severity !== 'error') {
          return;
        }
        const error = errors[0];
        console.log(error);
        notifier.notify({
          title: '👒 Webpack Build Error',
          message: severity + ':' + error.name,
          subtitle: error.file || '',
          icon: join(__dirname, 'icon.png')
        });
      }
    }),
    new WebpackBuildNotifierPlugin({
      title: '💿 Solv Dvelopment Notification',
      // logo,
      suppressSuccess: true
    })
    // new BundleAnalyzerPlugin(),
  ]
};
