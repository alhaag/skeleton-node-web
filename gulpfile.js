/*
 * Install dependencies:
 * npm install --save-dev gulp gulp-babel gulp-jshint gulp-uglify gulp-less gulp-minify-css gulp-rename browser-sync gulp-nodemon
 */

'use strict';

var gulp = require('gulp'),
  babel = require('gulp-babel'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  less = require('gulp-less'),
  minifyCss = require('gulp-minify-css'),
  rename = require('gulp-rename'),
  browserSync = require('browser-sync'),
  nodemon = require('gulp-nodemon'),
  tar = require('gulp-tar'),
  gzip = require('gulp-gzip'),
  path = require('path'),
  i18next = require('i18next-parser');

gulp.task('default', ['transpile', /*'lint',*/ 'uglify', 'less', 'browser-sync'], function () {
  // place code for your default task here
});

gulp.task('pack', function() {
  var p = require('./package.json');
  console.log('teste ----------');
  console.log(p.dependencies);
  return gulp.src(['views/**/*', 'public/**/*'], { base: '../node-base/'})
    .pipe(tar('archive.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('dist'));
});

// ECMA 6 to ECMA 5.1
gulp.task('transpile', function () {
  return gulp.src('assets/js/*.js')
    .pipe(babel())
    .pipe(gulp.dest('assets/js/transpile'));
});

// syntactic analysis javascript
/*gulp.task('lint', ['transpile'], function(){
 return gulp.src(['assets/*.js'])
 .pipe(jshint())
 .pipe(jshint.reporter('default'));
 });*/

// minify javascript
gulp.task('uglify', ['transpile'], function () {
  return gulp.src('assets/js/transpile/*.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('public/js'));
});

// less preprocessor and minify
gulp.task('less', function () {
  return gulp.src('assets/less/**/*.less')
    .pipe(less({
      paths: [path.join(__dirname, 'less', 'includes')]
    }))
    .pipe(minifyCss())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./public/css'));
});

// sync browser
gulp.task('browser-sync', ['nodemon', 'watch'], function () {
  browserSync.init(null, {
    proxy: "http://localhost:3000",
    files: [
      "public/**/*.*",
      "views/**/*.jade"
    ],
    //browser: "google chrome",
    port: 5000
  });
});

// start node
gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon({script: './bin/www'}).on('start', function () {
    if (!called) {
      called = true;
      cb();
    }
  });
});

gulp.task('i18n', function() {
  gulp.src(['views/**/*', 'assets/**/*', './*.js'])
    .pipe(i18next({
      locales: ['pt', 'en'],
      functions: ['__'],
      output: '../locales' // compara o que ja foi traduzido para não limpar
    }))
    .pipe(gulp.dest('locales'));
});

// watch files
gulp.task('watch', function () {
  gulp.watch('assets/js/*.js', ['transpile']);
  gulp.watch('assets/js/transpile/*.js', ['uglify']);
  gulp.watch('assets/less/**/*.less', ['less']);
});