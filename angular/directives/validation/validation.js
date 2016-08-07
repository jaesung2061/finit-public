(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('ValidationCtrl', function ($scope) {
            $scope.errors = null;

            $scope.close = function () {
                $scope.errors = null;
            };
        });

})();
