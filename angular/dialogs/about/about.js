(function(){
    "use strict";

    angular.module('app.controllers')
        .controller('AboutDialogController', function ($scope, $state, DialogService) {

            $scope.hideAndGoToFinit = function () {
                $state.go('app.chat.show', {title: 'Finit'});
                DialogService.hide();
            };

            $scope.hide = function () {
                DialogService.hide();
            };

        });

})();
