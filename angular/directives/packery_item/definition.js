(function () {
    "use strict";

    angular.module('app.directives')
        .directive('packeryItem', function () {

            return {
                restrict: 'EA',
                controller: 'PackeryItemController',
                templateUrl: 'views/directives/packery_item/packery_item.html',
                transclude: true,
                link: function ($scope, $element, $attrs) {

                }
            };
        });
})();
