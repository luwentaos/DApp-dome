// 开启JS多线程压缩
const TerserPlugin = require('terser-webpack-plugin');
// 开启CSS多线程压缩
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { resolve, join } = require('path'); // resolve 用于拼接绝对路径，join 用于拼接路径
// HtmlWebpackPlugin 作用是生成一个html文件，自动引入打包后的js文件
const HtmlWebpackPlugin = require('html-webpack-plugin');
// WorkboxPlugin 用于生成 service worker
const WorkboxPlugin = require('workbox-webpack-plugin');

class RemoveScriptsPlugin {
  constructor(options) {
    this.options = options || {};
    this.chunksToRemove = options.chunksToRemove || []; // 需要移除的 chunk 名称列表
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('RemoveScriptsPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).afterEmit.tapAsync(
        'RemoveScriptsPlugin',
        (data, cb) => {
          let html = data.html;
          // 遍历需要移除的 chunk 名称
          this.chunksToRemove.forEach((chunkName) => {
            const regex = new RegExp(
              `<script[^>]*src=["']/dist/${chunkName}\\.[^"']+\\.bundle\\.js["'][^>]*></script>`,
              'i'
            );
            html = html.replace(regex, '');
          });
          data.html = html;
          cb(null, data);
        }
      );
    });
  }
}

class InlineRuntimePlugin {
  constructor(options) {
    this.options = options || {};
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('InlineRuntimePlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(
        'InlineRuntimePlugin',
        (data, cb) => {
          const runtimeFile = Object.keys(compilation.assets).find(
            (file) => file.includes('runtime') && file.endsWith('.bundle.js')
          );
          const runtimeContent = runtimeFile
            ? compilation.assets[runtimeFile].source().toString()
            : '';

          // 修改 assetTags，移除 runtime 和 main 的 src，内联 runtime
          console.log('++++', data);
          data.assetTags.bodyTags = data.assetTags.bodyTags.filter((tag) => {
            const src = tag.attributes?.src || '';
            return !src.includes('runtime') && !src.includes('main');
          });

          // 添加内联 runtime 脚本
          data.assetTags.bodyTags.push({
            tagName: 'script',
            voidTag: false,
            innerHTML: runtimeContent
          });

          cb(null, data);
        }
      );
    });
  }
}

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
  /**
   * 使用module方式，这种方式不用改造index.html，直接引入模块即可
    experiments: {
      // 开启输出模块类型
      outputModule: true
    },
    // 配置外部依赖类型
    externalsType: 'module',
    externals: {
      react: 'https://esm.sh/react@19.0.0',              // 模块路径
      'react-dom': 'https://esm.sh/react-dom@19.0.0/client', // 模块路径
      'react-router-dom': 'https://esm.sh/react-router-dom@6.23.0', // 模块路径
    },
   */
  // 配置外部依赖-减少打包体积
  externals: {
    react: 'React',
    'react-dom/client': 'ReactDOM',
    'react-router-dom': 'ReactRouterDOM'
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
      favicon: './public/favicon.ico',
      templateParameters: (compilation, assets, assetTags, options) => {
        const runtimeFile = Object.keys(compilation.assets).find(
          (file) => file.includes('runtime') && file.endsWith('.bundle.js')
        );
        const runtimeContent = runtimeFile
          ? compilation.assets[runtimeFile].source().toString()
          : '';
        return {
          compilation,
          webpackConfig: compilation.options,
          htmlWebpackPlugin: {
            tags: assetTags,
            files: assets,
            options
          },
          runtimeContent
        };
      }
    }),
    // new InlineRuntimePlugin(), // 自定义插件内联 runtime
    new RemoveScriptsPlugin({
      chunksToRemove: ['chunk-react-libs', 'chunk-web3-sdk']
    }) // 自定义插件移除 已缓存本地文件 的 script
  ]
};
