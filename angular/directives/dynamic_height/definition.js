(function () {
    "use strict";

    angular.module('app.directives').directive('dynamicHeight', function ($timeout) {

        return {
            restrict: 'EA',
            link: function ($scope, $element, $attrs) {
                var heightOffset = $scope.$eval($attrs.dynamicHeight);
                var height = window.innerHeight - heightOffset;
                var timeout;

                $element.css({
                    'min-height': height,
                    'max-height': height,
                    'height': height
                });

                angular.element(window).resize(function () {
                    height = window.innerHeight - heightOffset;
                    $element.css({
                        'min-height': height,
                        'max-height': height,
                        'height': height
                    });
                });
            }
        };
    });

})();
