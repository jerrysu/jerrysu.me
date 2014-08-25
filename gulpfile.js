'use strict';

var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var cache = require('gulp-cached');
var csslint = require('gulp-csslint');
var cssmin = require('gulp-minify-css');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var revall = require('gulp-rev-all');
var rsync = require('gulp-rsync');

var browserSync = require('browser-sync');
var rimraf = require('rimraf');
var runSequence = require('run-sequence');

var pkg = require('./package.json');

gulp.task('clean', function(next) {
  rimraf('build', next);
});

gulp.task('copy', ['clean'], function() {
  return gulp.src('src/**').pipe(gulp.dest('build'));
});

gulp.task('build', ['copy'], function(next) {
  runSequence(['build-css', 'build-html'], next);
});

gulp.task('build-css', function() {
  return gulp.src(['src/**/*.css', '!src/**/*.min.css'])
    .pipe(cache('css'))
    .pipe(autoprefixer({
      cascade: false /* Note: This doesn't seem to work. */
    }))
    .pipe(gulp.dest('build'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('build-html', function() {
  return gulp.src('src/**/*.html')
    .pipe(cache('html'))
    .pipe(gulp.dest('build'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('cache-bust', ['build'], function() {
  return gulp.src('build/**')
    .pipe(revall({
      ignore: [/^\/favicon.ico$/, '.html', /^\/fonts\//]
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('minify', ['clean', 'copy', 'build', 'cache-bust'], function(next) {
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
  gulp.watch('src/**/*.css', ['build-css']);
  gulp.watch('src/**/*.html', ['build-html']);

  browserSync({server: {baseDir: 'build'}}, next);
});

gulp.task('deploy', ['clean', 'copy', 'build', 'cache-bust', 'minify'], function(next) {
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
