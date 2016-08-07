(function () {
    "use strict";

    angular.module('app.directives')
        .directive('validation', function () {

            return {
                restrict: 'EA',
                templateUrl: 'views/directives/validation/validation.html',
                controller: 'ValidationCtrl',
                scope: {
                    errors: '='
                },
                link: function ($scope, $element, $attrs) {
                    //
                }
            };

        });

})();
