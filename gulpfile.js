process.env.DISABLE_NOTIFIER = true;

var elixir = require('laravel-elixir');
require('./tasks/angular.task.js');
require('./tasks/bower.task.js');
require('laravel-elixir-livereload');


/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Less
 | file for our application, as well as publishing vendor resources.
 |
 */

elixir(function (mix) {
    mix
        .bower()
        .angular('./angular/')
        .copy('./angular/app/**/*.html', 'public/views/app/')
        .copy('./angular/directives/**/*.html', 'public/views/directives/')
        .copy('./angular/dialogs/**/*.html', 'public/views/dialogs/')
        .copy('./angular/toasts/**/*.html', 'public/views/toasts/')
        .copy('./angular/bottom-sheets/**/*.html', 'public/views/bottom-sheets/')
        .livereload([
            'public/js/vendor.js',
            'public/js/app.js'
        ], {liveCSS: true})
        .phpUnit();
});
