'use strict';

var gulp = require('gulp');
var addsrc = require('gulp-add-src');
var cache = require('gulp-cached');
var csslint = require('gulp-csslint');
var cssmin = require('gulp-minify-css');
var filter = require('gulp-filter');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var postcss = require('gulp-postcss');
var replace = require('gulp-replace');
var revall = require('gulp-rev-all');
var rimraf = require('gulp-rimraf');
var rsync = require('gulp-rsync');
var sass = require('gulp-ruby-sass');
var sourcemaps = require('gulp-sourcemaps');

var autoprefixer = require('autoprefixer-core');
var browserSync = require('browser-sync');
var del = require('del');
var mqpacker = require('css-mqpacker');
var path = require('path');
var runSequence = require('run-sequence');
var through = require('through2');

var pkg = require('./package.json');

gulp.task('clean', function(next) {
  del('build', next);
});

gulp.task('copy', ['clean'], function() {
  return gulp.src('src/**')
    .pipe(gulp.dest('build'));
});

gulp.task('build', ['copy'], function(next) {
  runSequence(['build-css', 'build-html'], next);
});

gulp.task('build-css', function() {
  var filterMap = filter('**/*.map');
  return gulp.src('src/**/*.scss')
    .pipe(cache('scss'))
    .pipe(sass())
    .pipe(filterMap)
    .pipe(addsrc(['src/**/*.css', '!src/**/*.min.css']))
    .pipe(cache('css'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(postcss([
      autoprefixer({cascade: false}),
      mqpacker
    ]))
    .pipe(sourcemaps.write({sourceRoot: '/'}))
    .pipe(filterMap.restore())
    .pipe(gulp.dest('build'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('build-html', function() {
  return gulp.src('src/**/*.html')
    .pipe(cache('html'))
    .pipe(replace(/([^="']+?)\.scss/, '$1.css'))
    .pipe(gulp.dest('build'))
    .pipe(browserSync.reload({stream: true}));
});

// Remove all development-related files.
gulp.task('clean-dev', ['build'], function() {
  return gulp.src([
    'build/**/*.scss',
    'build/**/*.css.map'
  ], {read: false}).pipe(rimraf());
});

gulp.task('cache-bust', ['build', 'clean-dev'], function() {
  return gulp.src('build/**')
    .pipe(revall({
      ignore: [/^\/favicon.ico$/, '.html', /^\/images\/og.jpg$/]
    }))
    .pipe(gulp.dest('build'))
    .pipe(through.obj(function(file, enc, cb) {
      this.push(file);
      // Remove all files that were cache-busted.
      if (file.path && file.revOrigPath) {
        del(file.revOrigPath, cb);
      } else {
        cb();
      }
    }));
});

gulp.task('minify', ['clean', 'copy', 'build', 'clean-dev', 'cache-bust'], function(next) {
  runSequence(['minify-css', 'minify-html'], next);
});

gulp.task('minify-css', function() {
  return gulp.src('build/**/*.css')
    .pipe(cssmin({
      root: '.',
      relativeTo: 'build',
      processImport: true
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('minify-html', function() {
  return gulp.src('build/**/*.html')
    .pipe(htmlmin({
      removeComments: true,
      removeCommentsFromCDATA: true,
      removeCDATASectionsFromCDATA: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      minifyJS: true,
      minifyCSS: true
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('optimize-images', function() {
  return gulp.src('src/images/**')
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(gulp.dest('src/images/'));
});

gulp.task('csslint', function() {
  gulp.src('src/**/*.css')
    .pipe(csslint())
    .pipe(csslint.reporter());
});

gulp.task('server', ['clean', 'copy', 'build'], function(next) {
  gulp.watch('src/**/*.scss', ['build-css']);
  gulp.watch('src/**/*.html', ['build-html']);

  browserSync({server: {baseDir: 'build'}}, next);
});

gulp.task('deploy', ['clean', 'copy', 'build', 'clean-dev', 'cache-bust', 'minify'], function(next) {
  return gulp.src('build/**')
    .pipe(rsync({
      root: 'build',
      hostname: pkg.targets.prod.host,
      destination: pkg.targets.prod.path,
      incremental: true,
      progress: true
    }));
});

gulp.task('default', function() {
  gulp.start('server');
});
