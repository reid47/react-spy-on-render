require('babel-polyfill');
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var webpack = require('webpack-stream');
var runSequence = require('run-sequence');

function testAssetsStream(watch) {
  return gulp
    .src(['src/**/*.js', 'spec/**/*_spec.js'])
    .pipe(plugins.plumber())
    .pipe(
      webpack({
        nodeEnv: 'test',
        devtool: 'eval',
        module: {
          loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
          ]
        },
        watch: watch,
        output: { filename: 'spec.js' }
      })
    );
}

gulp.task('spec', function() {
  return testAssetsStream(true)
    .pipe(plugins.jasmineBrowser.specRunner())
    .pipe(plugins.jasmineBrowser.server({ whenReady: plugins.whenReady }));
});

gulp.task('default', ['spec']);
