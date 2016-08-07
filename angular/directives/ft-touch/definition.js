(function () {
    "use strict";

    angular.module('app.directives')
        .directive('ftTouchstart', function () {
            return {
                restrict: 'A',
                link: function ($scope, $element, $attrs) {
                    $element.on('touchstart mousedown', function (event) {
                        $scope.$apply(function () {
                            $scope.$eval($attrs.ftTouchstart);
                        });
                    });
                }
            };
        })
        .directive('ftTouchend', function () {
            return {
                restrict: 'A',
                link: function ($scope, $element, $attrs) {
                    $element.on('touchend mouseup', function (event) {
                        $scope.$apply(function () {
                            $scope.$eval($attrs.ftTouchend);
                        });
                    });
                }
            };
        });

})();
