(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('ContactController', function ($scope, Restangular, ToastService) {
            $scope.contactFormData = {};

            $scope.submit = function () {
                Restangular.all('contact').post($scope.contactFormData).then(function (response) {
                    ToastService.show('Message has been sent! We will respond to you as soon as possible.')
                }, function (response) {
                    $scope.errors = response.data;
                });
            };
        });

})();
