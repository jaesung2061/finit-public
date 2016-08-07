(function () {
    "use strict";

    var app = angular.module('app',
        [
            'ngAnimate',
            'ngFileUpload',
            'ngTouch',
            //'facebook',
            'perfect_scrollbar',
            'luegg.directives',
            'angular-img-cropper',
            'ng-showdown',
            'angulartics',
            'angulartics.google.analytics',
            'app.controllers',
            'app.filters',
            'app.services',
            'app.directives',
            'app.routes',
            'app.config'
        ]);

    angular.module('app.routes', ['ui.router', 'ngStorage', 'satellizer', 'ui.bootstrap']);
    angular.module('app.controllers', ['ui.router', 'ngMaterial', 'ngStorage', 'restangular', 'ngMdIcons', 'angular-loading-bar']);
    angular.module('app.filters', []);
    angular.module('app.services', ['ui.router', 'ngStorage', 'restangular']);
    angular.module('app.directives', []);
    angular.module('app.config', []);

    //console.log(".----------------.  .----------------.  .-----------------. .----------------.  .----------------.");
    //console.log("| .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |");
    //console.log("| |  _________   | || |     _____    | || | ____  _____  | || |     _____    | || |  _________   | |");
    //console.log("| | |_   ___  |  | || |    |_   _|   | || ||_   \\|_   _| | || |    |_   _|   | || | |  _   _  |  | |");
    //console.log("| |   | |_  \\_|  | || |      | |     | || |  |   \\ | |   | || |      | |     | || | |_/ | | \\_|  | |");
    //console.log("| |   |  _|      | || |      | |     | || |  | |\\ \\| |   | || |      | |     | || |     | |      | |");
    //console.log("| |  _| |_       | || |     _| |_    | || | _| |_\\   |_  | || |     _| |_    | || |    _| |_     | |");
    //console.log("| | |_____|      | || |    |_____|   | || ||_____|\\____| | || |    |_____|   | || |   |_____|    | |");
    //console.log("| |              | || |              | || |              | || |              | || |              | |");
    //console.log("| '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |");
    //console.log("'----------------'  '----------------'  '----------------'  '----------------'  '----------------'");
})();
