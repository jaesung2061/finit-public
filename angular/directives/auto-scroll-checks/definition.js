(function () {
    "use strict";

    angular.module('app.directives')
        .directive('autoScrollChecks', function () {

            return {
                restrict: 'EA',
                link: function ($scope, $element, $attrs) {
                    $scope.allowAutoScroll = true;

                    $element.scroll(function () {
                        var positionIsAtBottom = $element.scrollTop() + $element.height() === $element.prop('scrollHeight');
                        $scope.allowAutoScroll = !!positionIsAtBottom;
                    });
                    $element.mouseleave(function () {
                        $scope.allowAutoScroll = true;
                    });
                }
            };

        });

})();
