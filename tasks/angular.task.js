/*Elixir Task
*copyrights to https://github.com/HRcc/laravel-elixir-angular
*/
var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var notify = require('gulp-notify');
var gulpif = require('gulp-if');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var minify = require('gulp-minify-css');

var Elixir = require('laravel-elixir');

var Task = Elixir.Task;

Elixir.extend('angular', function(src, output, outputFilename) {

	var baseDir = src || Elixir.config.assetsPath + '/angular/';

	new Task('angular in ' + baseDir, function() {
		// Main file has to be included first.
		gulp.src([baseDir + 'helpers.js', baseDir + "main.js", baseDir + "**/*.js"])
			.pipe(jshint())
			.pipe(jshint.reporter(stylish))
			//.pipe(jshint.reporter('fail')).on('error', onError) //enable this if you want to force jshint to validate
			.pipe(gulpif(! config.production, sourcemaps.init()))
			.pipe(concat(outputFilename || 'app.js'))
			.pipe(ngAnnotate())
			.pipe(gulpif(config.production, uglify()))
			.pipe(gulpif(! config.production, sourcemaps.write()))
			.pipe(gulp.dest(output || config.js.outputFolder));

        return gulp.src([baseDir + "main.scss", baseDir + "**/*.scss"])
            .pipe(sass())
            .pipe(autoprefixer('last 5 versions'))
            .pipe(concat('app.css'))
            .pipe(gulpif(config.production, minify()))
            .pipe(gulp.dest('public/css'));
	}).watch(baseDir + '/**/*.*');

});
