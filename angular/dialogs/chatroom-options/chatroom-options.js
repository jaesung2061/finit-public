(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('ChatroomOptionsDialogController', function ($rootScope, $scope, DialogService) {

            $scope.settings = $rootScope.currentUser.settings;

            $scope.save = function () {
                //
            };

            $scope.hide = function () {
                DialogService.hide();
            };

        });

})();
