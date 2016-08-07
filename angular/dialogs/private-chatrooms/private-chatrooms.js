(function(){
    "use strict";

    angular.module('app.controllers')
        .controller('PrivateChatroomsDialogController', function ($scope, DialogService, Restangular) {

            $scope.createPrivateRoom = function () {
                Restangular.all('chatrooms').post({
                    type: 'private',
                    title: $scope.formData.type,
                    access_level: $scope.formData.access_level
                }).then(function (response) {
                    console.log(response);
                }, function (response) {
                    console.log(response.data);
                });
            };

            $scope.hide = function () {
                DialogService.hide();
            };

        });

})();
