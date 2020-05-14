/* eslint-disable @typescript-eslint/no-var-requires, no-console  */
const path = require('path');
const fs = require('fs');

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const DEV = process.env.NODE_ENV === 'development';
const CONTEXT = process.cwd();

console.log({ DEV, CONTEXT });

const config = {
  context: CONTEXT,
  entry: './src/client.tsx',
  target: 'web',
  mode: DEV ? 'development' : 'production',
  stats: {
    children: false
  },
  devServer: {
    contentBase: false,
    port: 8181,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './certificates/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, './certificates/localhost.pem'))
    }
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'static/[name].js',
    chunkFilename: 'static/[name].[id].js',
    publicPath: '/v2'
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.(j|t)sx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        ],
        exclude: [/node_modules/]
      },
      {
        test: /\.module\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: '@wings-software/css-types-loader',
            options: {
              prettierConfig: CONTEXT
            }
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                mode: 'local',
                localIdentName: DEV ? '[name]_[local]_[hash:base64:6]' : '[hash:base64:6]'
              },
              localsConvention: 'camelCaseOnly'
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [path.join(CONTEXT, 'src', 'styles')]
              },
              sourceMap: false,
              implementation: require('sass')
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /(?<!\.module)\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: false
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [path.join(CONTEXT, 'src', 'styles')]
              },
              implementation: require('sass')
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: false
            }
          }
        ]
      },
      {
        test: /\.(jpg|jpeg|png|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 2000,
              fallback: 'file-loader'
            }
          }
        ]
      }
    ]
  },
  devtool: DEV ? 'cheap-module-source-map' : 'none',
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.tsx'],
    plugins: [new TsconfigPathsPlugin()]
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'static/styles.css',
      chunkFilename: 'static/styles.[id].css'
    }),
    new HTMLWebpackPlugin({
      template: 'src/static/index.html',
      filename: 'index.html',
      showErrors: false
    }),
    new CopyWebpackPlugin([
      {
        from: 'src/static'
      }
    ])
  ]
};

if (DEV) {
  config.plugins.concat([new ForkTsCheckerWebpackPlugin({ tsconfig: 'tsconfig.json' })]);
}

module.exports = config;
