const jshint = require('gulp-jshint');
const gulp   = require('gulp');

gulp.task('lint', function() {
  // Excluding models folder due to being generated by ORM
  return gulp.src('./src/**/*.js', '!./src/models/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});