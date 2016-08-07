(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('HeaderCtrl', function ($scope, $rootScope, $mdSidenav, $log) {

            $scope.openSideNav = function () {
                $mdSidenav('left').open();
            };

        });

})();