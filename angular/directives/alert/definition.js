(function () {
    "use strict";

    angular.module('app.directives')
        .directive('alert', function () {

            return {
                restrict: 'EA',
                templateUrl: 'views/directives/alert/alert.html',
                controller: 'AlertController',
                link: function (scope, element, attrs) {
                    //
                }
            };

        });

})();
