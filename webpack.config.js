/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable @typescript-eslint/no-var-requires, no-console  */

const buildVersion = JSON.stringify(require('./package.json').version)
const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const devServerProxyConfig = require('./webpack.devServerProxy.config')

const {
  container: { ModuleFederationPlugin }
} = webpack
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const CircularDependencyPlugin = require('circular-dependency-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const JSONGeneratorPlugin = require('@harness/jarvis/lib/webpack/json-generator-plugin').default
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const GenerateStringTypesPlugin = require('./scripts/webpack/GenerateStringTypesPlugin').GenerateStringTypesPlugin
const { BugsnagSourceMapUploaderPlugin } = require('webpack-bugsnag-plugins')
const moduleFederationConfig = require('./configs/modulefederation.config.js')
const ExternalRemotesPlugin = require('external-remotes-plugin')

const DEV = process.env.NODE_ENV === 'development'
const HARNESS_ENABLE_NG_AUTH_UI = process.env.HARNESS_ENABLE_NG_AUTH_UI !== 'false'
// this BUGSNAG_TOKEN needs to be same which is passed in the docker file
const BUGSNAG_TOKEN = process.env.BUGSNAG_TOKEN
const BUGSNAG_SOURCEMAPS_UPLOAD = `${process.env.BUGSNAG_SOURCEMAPS_UPLOAD}` === 'true'
const CONTEXT = process.cwd()
const isCypressCoverage = process.env.CYPRESS_COVERAGE
const isCypress = process.env.CYPRESS
const babelLoaderConfig = {
  loader: 'babel-loader'
}
const tsLoaderConfig = {
  loader: 'ts-loader',
  options: {
    transpileOnly: true
  }
}
const tsLoaders = []
if (isCypress && isCypressCoverage) {
  tsLoaders.push(babelLoaderConfig)
  tsLoaders.push(tsLoaderConfig)
} else {
  tsLoaders.push(tsLoaderConfig)
}

/**
 * section for microfrontends
 */
const ChildAppError = path.resolve(CONTEXT, './src/microfrontends/ChildAppError.tsx')
const enableGitOpsUI = process.env.ENABLE_GITOPSUI === 'true'
const enableSTO = process.env.ENABLE_STO === 'true'
const moduleFederationEnabled = true

const certificateExists = fs.existsSync('./certificates/localhost.pem')
if (DEV && !certificateExists) {
  throw new Error('The certificate is missing, please run `yarn generate-certificate`')
}

const config = {
  context: CONTEXT,
  entry: './src/framework/app',
  target: 'web',
  mode: DEV ? 'development' : 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: DEV ? '/' : '',
    filename: DEV ? 'static/[name].js' : 'static/[name].[contenthash:6].js',
    chunkFilename: DEV ? 'static/[name].[id].js' : 'static/[name].[id].[contenthash:6].js',
    pathinfo: false
  },
  devtool: DEV ? 'cheap-module-source-map' : 'hidden-source-map',
  devServer: DEV
    ? {
        historyApiFallback: true,
        port: 8181,
        https: {
          key: fs.readFileSync(path.resolve(__dirname, './certificates/localhost-key.pem')),
          cert: fs.readFileSync(path.resolve(__dirname, './certificates/localhost.pem'))
        },
        proxy: Object.fromEntries(
          Object.entries(devServerProxyConfig).map(([key, value]) => [
            key,
            Object.assign({ logLevel: 'info', secure: false, changeOrigin: true }, value)
          ])
        )
      }
    : undefined,
  stats: {
    modules: false,
    children: false
  },
  cache: DEV ? { type: 'filesystem' } : false,
  module: {
    rules: [
      {
        test: /\.m?js$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: tsLoaders
      },
      {
        test: /\.module\.scss$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: '@harness/css-types-loader',
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
                localIdentName: DEV ? '[name]_[local]_[hash:base64:6]' : '[hash:base64:6]',
                exportLocalsConvention: 'camelCaseOnly'
              }
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [path.join(CONTEXT, 'src')]
              },
              sourceMap: false,
              implementation: require('sass')
            }
          }
        ]
      },
      {
        test: /(?<!\.module)\.scss$/,
        exclude: /node_modules/,
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
                includePaths: [path.join(CONTEXT, 'src')]
              },
              implementation: require('sass')
            }
          }
        ]
      },
      {
        test: /\.(jpg|jpeg|png|svg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 2000,
              fallback: 'file-loader'
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.ttf$/,
        loader: 'file-loader'
      },
      {
        test: /\.ya?ml$/,
        type: 'json',
        use: [
          {
            loader: 'yaml-loader'
          }
        ]
      },
      {
        test: /\.gql$/,
        type: 'asset/source'
      },
      {
        test: /\.(mp4)$/,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.tsx', '.json', '.ttf'],
    plugins: [new TsconfigPathsPlugin()],
    alias: {
      '@wings-software': '@harness'
    }
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
}

const commonPlugins = [
  new MiniCssExtractPlugin({
    filename: DEV ? 'static/[name].css' : 'static/[name].[contenthash:6].css',
    chunkFilename: DEV ? 'static/[name].[id].css' : 'static/[name].[id].[contenthash:6].css'
  }),
  new HTMLWebpackPlugin({
    template: 'src/index.html',
    filename: 'index.html',
    minify: false,
    templateParameters: {
      __DEV__: DEV
    }
  }),
  new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
  new webpack.DefinePlugin({
    'process.env': '{}', // required for @blueprintjs/core
    __DEV__: DEV,
    __BUGSNAG_RELEASE_VERSION__: buildVersion,
    HARNESS_ENABLE_NG_AUTH_UI: HARNESS_ENABLE_NG_AUTH_UI
  }),
  new MonacoWebpackPlugin({
    // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
    languages: ['json', 'yaml', 'shell', 'powershell']
  }),
  new GenerateStringTypesPlugin()
]

if (moduleFederationEnabled) {
  commonPlugins.unshift(new ExternalRemotesPlugin())
  commonPlugins.unshift(new ModuleFederationPlugin(moduleFederationConfig({ enableGitOpsUI, enableSTO })))
}

if (!enableGitOpsUI) {
  // render a mock app when MF is disabled
  config.resolve.alias['gitopsui/MicroFrontendApp'] = ChildAppError
}

if (!enableSTO) {
  config.resolve.alias['sto/App'] = ChildAppError
  config.resolve.alias['sto/PipelineSecurityView'] = ChildAppError
}

const devOnlyPlugins = [
  new webpack.WatchIgnorePlugin({
    paths: [/node_modules(?!\/@harness)/, /\.d\.ts$/, /stringTypes\.ts/]
  }),
  new ForkTsCheckerWebpackPlugin()
  // new BundleAnalyzerPlugin()
]

const prodOnlyPlugins = [
  new JSONGeneratorPlugin({
    content: {
      version: require('./package.json').version,
      gitCommit: process.env.GIT_COMMIT,
      gitBranch: process.env.GIT_BRANCH
    },
    filename: 'static/version.json'
  }),
  new CircularDependencyPlugin({
    exclude: /node_modules/,
    failOnError: true
  }),
  new HTMLWebpackPlugin({
    template: 'src/versions.html',
    filename: 'static/versions.html',
    minify: false,
    inject: false
  })
]
if (BUGSNAG_SOURCEMAPS_UPLOAD && BUGSNAG_TOKEN) {
  prodOnlyPlugins.push(
    new BugsnagSourceMapUploaderPlugin({
      apiKey: BUGSNAG_TOKEN,
      appVersion: require('./package.json').version,
      publicPath: '*',
      overwrite: true
    })
  )
}
config.plugins = commonPlugins.concat(DEV ? devOnlyPlugins : prodOnlyPlugins)

console.table({
  DEV,
  FsEvents: process.env.TSC_WATCHFILE === 'UseFsEvents',
  BUGSNAG_SOURCEMAPS_UPLOAD,
  BugsnagTokenPresent: !!BUGSNAG_TOKEN,
  HARNESS_ENABLE_NG_AUTH_UI
})

module.exports = config
