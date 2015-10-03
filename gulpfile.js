'use strict';

// core utilities
var gulp = require('gulp'),
  gutil = require('gulp-util'),
  notify = require('gulp-notify'),
  argv = require('yargs').argv,
  gulpif = require('gulp-if'),
  browserSync = require('browser-sync');

// css utilities
var sass = require('gulp-sass'),
  cssGlobbing = require('gulp-css-globbing'),
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  mqpacker = require('css-mqpacker'),
  sourcemaps = require('gulp-sourcemaps');

//  should we build sourcemaps? "gulp build --sourcemaps"
var buildSourceMaps = !!argv.sourcemaps;

// allow proxy address to be configured. ex. --proxy=mylocalurl.dev
var proxyAddress = argv.proxy;

// post CSS processors
var processors = [
  autoprefixer({browsers: ['last 2 version', 'IE 9']}), // specify browser compatibility with https://github.com/ai/browserslist
  mqpacker // this will reorganize css into media query groups, better for performance
];

// error notifications
var handleError = function (task) {
  return function (err) {
    gutil.beep();

    notify.onError({
      title: task,
      message: err.message,
      sound: false,
      icon: false
    })(err);

    gutil.log(gutil.colors.bgRed(task + ' error:'), gutil.colors.red(err));

    this.emit('end');
  };
};


//Do our sassy work.
gulp.task('sass', function () {
  gutil.log(gutil.colors.yellow('Compiling the theme CSS!'));
  return gulp.src('./sass/*.scss')
    .pipe(cssGlobbing({
      extensions: ['.scss']
    }))
    .pipe(gulpif(buildSourceMaps, sourcemaps.init()))
    .pipe(sass())
    .on('error', handleError('Sass Compiling'))
    .pipe(gulpif(buildSourceMaps, sourcemaps.write()))
    .pipe(postcss(processors))
    .on('error', handleError('Post CSS Processing'))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream());
});


//task to watch and take action on our files when they change.
gulp.task('watch', function() {
  if(!proxyAddress) {
    gutil.log('No proxy using default drupal.dev');
    proxyAddress = 'drupal.dev';
  }

  gutil.log(gutil.colors.yellow('Watching your work! Using ' + proxyAddress + ' for BrowserSync'));
  gutil.log(gutil.colors.yellow('Using ' + proxyAddress + ' for BrowserSync'));

  browserSync.init({
    proxy: proxyAddress
  });

  gulp.watch("./sass/**/*.scss", ['sass']);
});
