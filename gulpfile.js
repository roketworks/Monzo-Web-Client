'use strict';

const gulp = require('gulp');
const watch = require('gulp-watch');
const gulpif = require('gulp-if');
const argv = require('yargs').argv;
const jshint = require('gulp-jshint');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const replace = require('gulp-replace');
const pug = require('gulp-pug');
const pugwatch = require('gulp-watch-pug');
const sourcemaps = require('gulp-sourcemaps');
const relativesourcemaps = require('gulp-relative-sourcemaps-source');
const browserify = require('gulp-browserify');

const paths = {
  src: './src/**/*.js', 
  config: './src/**/*.json',
  views: './src/**/*.pug',
  models: './src/models/**/*.js', 
  migrations: './src/migrations/**/*.js', 
  dist: './dist', 
  clientjs: ['./dist/utils/transactionUtil.js']
}

const precompileViews = () => {
  return gulp.src([paths.views])
    .pipe(pug({client: true}))
    .pipe(replace('function template(locals)', 'module.exports = function(locals, jade)'))
    .pipe(gulp.dest(paths.dist))
};

gulp.task('jslint', () => {
  // Excluding models & migrations folder due to being generated by ORM
  return gulp.src([paths.src, '!' + paths.models, '!' + paths.migrations])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('sass', () => {
  return gulp.src('./src/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
}); 

gulp.task('babel', ['cleanDist'], () => {
  return gulp.src([paths.src])
    .pipe(gulpif(!argv.production, sourcemaps.init()))
    .pipe(babel())
    .pipe(gulpif(!argv.production, relativesourcemaps({dest: 'dist'})))
    .pipe(gulpif(!argv.production, sourcemaps.write('.')))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('views', ['babel'], () => {
  if (argv.production) {
    return precompileViews();
  } else {
    return gulp.src([paths.views])
      .pipe(gulp.dest(paths.dist));
  }
});

gulp.task('config', ['babel'], () => {
  return gulp.src([paths.config])
    .pipe(gulp.dest(paths.dist))
});

gulp.task('cleanDist', function () {
  var del = require('del');
  return del(paths.dist);
});

// Browserify some clientjs
// only to be ran after babel task
// Possibly think about running seperate babel tasks with different presets for this task
gulp.task('clientjs', ['babel'], () => {
  gulp.src(paths.clientjs)
    .pipe(browserify({standalone: 'transactionUtil'}))
    .pipe(gulp.dest('./public/js'));
});

gulp.task('build', ['cleanDist', 'babel', 'views', 'config', 'clientjs']);
gulp.task('lint', ['jslint']);