/**
 * Webpack configuration for the demo service. This is used to start
 * a demonstration server that serves an example as well as the
 * documentation for this library.
 */

const webpack = require('webpack');
const path = require('path');

/**
 * Webpack Plugins
 */
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const IgnorePlugin = require('webpack/lib/IgnorePlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');
const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');

/**
 * Helpers
 */
function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [path.resolve(__dirname, '..')].concat(args));
}

/**
 * Plugin initializations
 */
const extractCSS = new ExtractTextPlugin({
  filename: '[name].[id].css',
  allChunks: true
});

/**
 * Webpack configuration
 */
module.exports = {

  devServer: {
    stats: 'minimal',
    inline: true
  },

  devtool: 'cheap-module-eval-source-map',

  entry: {
    'polyfills-header': './src/polyfills.ts',
    'vendor-header': './src/vendor.ts',
    'header': './src/demo.ts'
  },

  resolve: {
    extensions: ['.webpack.js', '.wep.js', '.js', '.ts']
  },

  stats: {
    colors: true,
    reasons: true
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loaders: [
          'awesome-typescript-loader',
          'angular2-template-loader'
        ],
        exclude: [/\.(spec|e2e)\.ts$/]
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.css$/,
        loader: extractCSS.extract({
          fallback: "style-loader",
          use: "css-loader?sourceMap&context=/"
        })
      },
      {
        test: /\.less$/,
        loaders: [
          {
            loader: 'css-to-string-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              context: '/'
            }
          },
          {
            loader: 'less-loader',
            options: {
              paths: ['./node_modules/patternfly/node_modules'],
              sourceMap: true
            }
          }
        ]
      },

      /**
       * File loader for supporting fonts, for example, in CSS files.
       */
      {
        test: /\.woff2?$|\.ttf$|\.eot$|\.svg$/,
        loaders: [
          {
            loader: "url-loader",
            query: {
              limit: 3000,
              name: 'assets/fonts/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.jpg$|\.png$|\.gif$|\.jpeg$/,
        loaders: [
          {
            loader: "url-loader",
            query: {
              limit: 3000,
              name: 'assets/fonts/[name].[ext]'
            }
          }
        ]
      }
    ]
  },

  output: {
    path: root('dist-demo'),
    publicPath: 'http://localhost:8002/',
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    sourceMapFilename: '[name].map',
    library: '[name]',
    libraryTarget: "amd"
  },

  plugins: [

    /*
     * Plugin: ExtractTextPlugin
     * Description: Defined above.
     */
    extractCSS,

    /*
     * Plugin: CommonsChunkPlugin
     * Description: Shares common code between the pages.
     * It identifies common modules and put them into a commons chunk.
     *
     * See: https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
     * See: https://github.com/webpack/docs/wiki/optimization#multi-page-app
     */
    new CommonsChunkPlugin({
      name: ['app', 'vendor', 'polyfills']
    }),

    /*
     * Plugin: HtmlWebpackPlugin
     * Description: Simplifies creation of HTML files to serve your webpack bundles.
     * This is especially useful for webpack bundles that include a hash in the filename
     * which changes every compilation.
     *
     * See: https://github.com/ampedandwired/html-webpack-plugin
     */
    new HtmlWebpackPlugin({
      chunksSortMode: 'dependency',
      template: 'src/demo.html'
    }),

    /**
     * Plugin: NamedModulesPlugin (experimental)
     * Description: Uses file names as module name.
     *
     * See: https://github.com/webpack/webpack/commit/a04ffb928365b19feb75087c63f13cadfc08e1eb
     */
    new NamedModulesPlugin(),

    /**
     * Plugin: ContextReplacementPlugin
     * Description: Provides context to Angular's use of System.import
     *
     * See: https://webpack.github.io/docs/list-of-plugins.html#contextreplacementplugin
     * See: https://github.com/angular/angular/issues/11580
     */
    new webpack.ContextReplacementPlugin(
      // The (\\|\/) piece accounts for path separators in *nix and Windows
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      root('src') // location of your src
    ),

    /**
     * Plugin: TypedocWebpackPlugin
     * Description: Builds the HTML documentation for the library.
     */
    new TypedocWebpackPlugin({
      name: 'PatternFly NG',
      mode: 'file',
      includeDeclarations: false,
      ignoreCompilerErrors: true,
      excludePrivate: true,
      exclude: '**/+(examples|demo)/**'
    }, './src')
  ],

  devServer: {
    historyApiFallback: true,
    stats: 'minimal',
    headers: {
      "Link" : `<http://localhost:8002/header.js>;rel="fragment-script"`
    }
  }
};
