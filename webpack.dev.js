const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  
  // Fast source maps for development
  devtool: 'eval-source-map',
  
  output: {
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
  },
  
  // Development server configuration
  devServer: {
    static: {
      directory: require('path').join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    hot: true, // Hot Module Replacement
    open: true, // Open browser automatically
    historyApiFallback: true, // SPA routing support
    client: {
      overlay: {
        errors: true,
        warnings: false, // Don't show warnings overlay
      },
      progress: true, // Show compilation progress
    },
    // Enable CORS for API requests
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  
  // Optimization for development
  optimization: {
    runtimeChunk: 'single', // Separate runtime chunk
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false, // Disable code splitting in dev for faster builds
  },
  
  // Cache for faster rebuilds
  cache: {
    type: 'filesystem',
    cacheDirectory: require('path').resolve(__dirname, '.webpack-cache'),
  },
  
  // Better performance in development
  performance: {
    hints: false, // Disable performance hints in development
  },
  
  // Stats for cleaner console output
  stats: {
    all: false,
    errors: true,
    warnings: true,
    assets: true,
    chunks: true,
    colors: true,
    timings: true,
    version: true,
  },
});