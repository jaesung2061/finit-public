(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('PagerController', function ($scope) {
            $scope.getIterations = function (n) {
                return new Array(n);
            };
            $scope.goToPage = function (direction) {
                $scope.pagerAction(direction);
            };
        });

})();
