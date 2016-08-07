(function(){
    "use strict";

    angular.module('app.controllers')
        .controller('HelpDialogController', function ($scope, DialogService, FACES) {

            $scope.faces = FACES;

            $scope.save = function () {
                //
            };

            $scope.hide = function () {
                DialogService.hide();
            };

        });

})();
