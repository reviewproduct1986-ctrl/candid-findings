const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  
  // Source maps for production (lighter than dev)
  devtool: 'source-map',
  
  output: {
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'assets/[name].[contenthash:8][ext]',
  },
  
  optimization: {
    minimize: true,
    minimizer: [
      // Minify JavaScript
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
            drop_console: true, // Remove console.log in production
            drop_debugger: true,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
        parallel: true,
        extractComments: false,
      }),
      // Minify CSS
      new CssMinimizerPlugin(),
    ],
    
    // Code splitting configuration
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 25,
      minSize: 20000,
      cacheGroups: {
        // React core libraries
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 20,
          reuseExistingChunk: true,
        },
        // React Router
        router: {
          test: /[\\/]node_modules[\\/]react-router-dom[\\/]/,
          name: 'router',
          priority: 19,
          reuseExistingChunk: true,
        },
        // React Markdown (lazy loaded with ReviewPage)
        markdown: {
          test: /[\\/]node_modules[\\/]react-markdown[\\/]/,
          name: 'markdown',
          priority: 18,
          reuseExistingChunk: true,
        },
        // Lucide icons
        icons: {
          test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
          name: 'icons',
          priority: 17,
          reuseExistingChunk: true,
        },
        // Other vendor code
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 10,
          reuseExistingChunk: true,
        },
        // Common code used across app
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    },
    
    // Runtime chunk for better caching
    runtimeChunk: {
      name: 'runtime',
    },
    
    // Deterministic module IDs for better caching
    moduleIds: 'deterministic',
    
    // Tree shaking
    usedExports: true,
    sideEffects: false,
  },
  
  // Performance budgets
  performance: {
    hints: 'warning',
    maxAssetSize: 244000, // 244 KB
    maxEntrypointSize: 244000,
    assetFilter: function(assetFilename) {
      // Don't check these file types
      return !assetFilename.endsWith('.map') && 
             !assetFilename.endsWith('.json') &&
             !/\.(png|jpg|jpeg|gif|svg|webp|woff|woff2|eot|ttf|otf)$/.test(assetFilename);
    },
  },
  
  // Stats for production build
  stats: {
    all: false,
    errors: true,
    warnings: true,
    assets: true,
    chunks: true,
    colors: true,
    timings: true,
    version: true,
    performance: true,
    entrypoints: true,
  },
});