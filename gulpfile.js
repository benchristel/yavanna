const gulp = require('gulp')
const jasmine = require('gulp-jasmine')

gulp.task('test', () => {
  gulp.src(['index.js', 'test.js'])
    .pipe(jasmine())
})
