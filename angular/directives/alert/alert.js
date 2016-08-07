(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('AlertController', function ($scope) {
            $scope.errors = null;

            $scope.close = function () {
                $scope.errors = null;
            };
        });

})();
