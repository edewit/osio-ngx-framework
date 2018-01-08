module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'browserify'],
    files: [
      { pattern: 'main.spec.js', watched: false }
    ],
    exclude: [
    ],
    preprocessors: {
      '../src/**/*.spec.js': ['webpack', 'sourcemap']
    },
    webpack: require('./webpack.test')({env: 'test'}),
    browserify: {
      debug: true,
      transform: [ 'browserify-shim' ]
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Chrome'],
    singleRun: true,
    concurrency: Infinity
  })
}