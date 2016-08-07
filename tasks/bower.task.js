/*Elixir Task for bower
 * Upgraded from https://github.com/ansata-biz/laravel-elixir-bower
 */
var gulp = require('gulp');
var mainBowerFiles = require('main-bower-files');
var filter = require('gulp-filter');
var notify = require('gulp-notify');
var minify = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var concat_sm = require('gulp-concat-sourcemap');
var concat = require('gulp-concat');
var gulpIf = require('gulp-if');

var Elixir = require('laravel-elixir');

var Task = Elixir.Task;

Elixir.extend('bower', function (jsOutputFile, jsOutputFolder, cssOutputFile, cssOutputFolder) {

    var cssFile = cssOutputFile || 'vendor.css';
    var jsFile = jsOutputFile || 'vendor.js';

    if (!Elixir.config.production) {
        concat = concat_sm;
    }

    var onError = function (err) {
        notify.onError({
            title: "Laravel Elixir",
            subtitle: "Bower Files Compilation Failed!",
            message: "Error: <%= error.message %>",
            icon: __dirname + '/../node_modules/laravel-elixir/icons/fail.png'
        })(err);
        this.emit('end');
    };

    new Task('bower-js', function () {
        var srcFiles = [
            'bower_components/fastclick/lib/fastclick.js',
            'bower_components/lightbox2/dist/js/lightbox.js',
            'bower_components/js-emoji/emoji.js',
            'bower_components/perfect-scrollbar/src/perfect-scrollbar.js',
            'bower_components/isotope/dist/isotope.pkgd.js',
            'bower_components/isotope-packery/packery-mode.pkgd.js',
            'bower_components/angular-scroll-glue/src/scrollglue.js',
            'bower_components/angular-facebook/lib/angular-facebook.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/angular-img-cropper/dist/angular-img-cropper.min.js',
            'bower_components/angulartics/dist/angulartics.min.js',
            'bower_components/angulartics-google-analytics/dist/angulartics-google-analytics.min.js',
            'bower_components/ngstorage/ngStorage.js',
            'bower_components/ng-file-upload/ng-file-upload.shim.js',
            'bower_components/ng-file-upload/ng-file-upload.js',
            'bower_components/svg-morpheus/compile/minified/svg-morpheus.js',
            'bower_components/angular-material-icons/angular-material-icons.min.js',
            'bower_components/satellizer/satellizer.js',
            'bower_components/angular-loading-bar/build/loading-bar.js',
            'bower_components/angular-loading-bar/build/loading-bar.css',
            'bower_components/get-style-property/get-style-property.js',
            'bower_components/classie/classie.js',
            'bower_components/eventie/eventie.js',
            'bower_components/eventEmitter/EventEmitter.js',
            'bower_components/matches-selector/matches-selector.js',
            'bower_components/angular-material/angular-material.js',
            'bower_components/angular-material/angular-material.css',
            'bower_components/restangular/dist/restangular.js',
            'bower_components/perfect-scrollbar/src/perfect-scrollbar.css',
            'bower_components/doc-ready/doc-ready.js',
            'bower_components/fizzy-ui-utils/utils.js',
            'bower_components/angular-perfect-scrollbar/src/angular-perfect-scrollbar.js',
            'bower_components/showdown/dist/showdown.js',
            'bower_components/ng-showdown/dist/ng-showdown.js',
            'bower_components/js-md5/js/md5.js'
        ];

        return gulp.src(srcFiles)
            .on('error', onError)
            .pipe(filter('**/*.js'))
            .pipe(concat(jsFile, {sourcesContent: true}))
            .pipe(gulpIf(Elixir.config.production, uglify()))
            .pipe(gulp.dest(jsOutputFolder || Elixir.config.js.outputFolder));
    }).watch('bower.json');

    var cssAssets = mainBowerFiles();
    cssAssets.push('bower_components/lightbox2/dist/css/lightbox.css');

    new Task('bower-css', function () {
        return gulp.src(cssAssets)
            .on('error', onError)
            .pipe(filter('**/*.css'))
            .pipe(concat(cssFile))
            .pipe(gulpIf(config.production, minify()))
            .pipe(gulp.dest(cssOutputFolder || config.css.outputFolder));
    }).watch('bower.json');

});
