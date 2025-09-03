const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Backend-Konfiguration
const backendConfig = {
  target: 'node',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './server.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.js',
    clean: false // Nicht löschen, da Frontend auch hier landet
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  node: '18'
                },
                modules: 'commonjs'
              }]
            ]
          }
        }
      }
    ]
  },
  externals: {
    // Exclude node_modules from bundle
    'pg': 'commonjs pg',
    'express': 'commonjs express',
    'cors': 'commonjs cors',
    'helmet': 'commonjs helmet',
    'express-rate-limit': 'commonjs express-rate-limit',
    'dotenv': 'commonjs dotenv',
    'multer': 'commonjs multer'
  },
  optimization: {
    minimize: false // Don't minify for better debugging
  },
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map'
};

// Frontend-Konfiguration
const frontendConfig = {
  target: 'web',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './frontend/src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist/public'),
    filename: 'bundle.js',
    publicPath: '/', // <-- nicht './', sondern '/'
    clean: false
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                quietDeps: true,
                silenceDeprecations: ['import']
              }
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './frontend/public/index.html',
      filename: 'index.html',
      inject: true,
      publicPath: '/', // Force relative paths in generated HTML
      minify: process.env.NODE_ENV === 'production' ? {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      } : false
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './package.json',
          to: '../package.json',
          transform: function(content) {
            const packageJson = JSON.parse(content.toString());
            // Entferne devDependencies und scripts für Produktion
            delete packageJson.devDependencies;
            delete packageJson.scripts;
            delete packageJson.browserslist;
            delete packageJson.proxy;
            // Füge nur start script hinzu
            packageJson.scripts = {
              start: 'node combined-server.js'
            };
            return JSON.stringify(packageJson, null, 2);
          }
        },
        {
          from: './.env',
          to: '../.env',
          toType: 'file'
        }
      ]
    })
  ]
};

// Development-Konfigurationen (separate Ports)
const devBackendConfig = {
  ...backendConfig,
  output: {
    ...backendConfig.output,
    path: path.resolve(__dirname, 'dist-dev'),
    clean: true
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './.env',
          to: '.env'
        }
      ]
    })
  ]
};

// Combined Server-Konfiguration (für Produktion)
const combinedServerConfig = {
  target: 'node',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './combined-server.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'combined-server.js',
    clean: false
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  node: '18'
                },
                modules: 'commonjs'
              }]
            ]
          }
        }
      }
    ]
  },
  externals: {
    'express': 'commonjs express',
    'cors': 'commonjs cors',
    'helmet': 'commonjs helmet',
    'express-rate-limit': 'commonjs express-rate-limit',
    'dotenv': 'commonjs dotenv',
    'pg': 'commonjs pg'
  },
  optimization: {
    minimize: false
  },
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map'
};

const devFrontendConfig = {
  target: 'web',
  mode: 'development',
  entry: './frontend/src/index.js',
  output: {
    path: path.resolve(__dirname, 'frontend/dist'),
    filename: 'bundle.js',
    publicPath: '/', // Force relative paths
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                quietDeps: true,
                silenceDeprecations: ['import']
              }
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './frontend/public/index.html',
      filename: 'index.html',
      inject: true,
      publicPath: './' // Force relative paths in generated HTML
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'frontend/public'),
    },
    port: 3001,
    hot: true,
    historyApiFallback: true,
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    ]
  }
};

// Funktion für Umgebungsvariablen
module.exports = (env) => {
  if (env && env.backend) {
    return backendConfig;
  } else if (env && env.frontend) {
    return frontendConfig;
  } else if (env && env.combined) {
    return combinedServerConfig;
  } else if (env && env.dev) {
    return [devBackendConfig, devFrontendConfig];
  } else {
    // Standard: Produktions-Build (Backend + Frontend + Combined-Server in dist)
    return [backendConfig, frontendConfig, combinedServerConfig];
  }
};
