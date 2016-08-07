(function () {
    "use strict";

    angular.module('app.directives')
        .directive('collapse', function () {
            return {
                link: function ($scope, $element, $attrs) {
                    $element.hide();

                    $scope.$watch($attrs.collapse, function (shouldCollapse) {
                        if (shouldCollapse) {
                            $element.slideUp({
                                duration: 'fast'
                            });
                        } else {
                            $element.slideDown({
                                duration: 'fast'
                            });
                        }
                    });
                }
            };
        });

})();
