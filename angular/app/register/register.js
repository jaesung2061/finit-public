(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('RegisterController', function ($rootScope, $scope, $state, Restangular, EVENTS) {
            var Users = Restangular.all('users');

            $scope.registrationFormData = {};

            $scope.register = function (formData) {
                Users.post(formData).then(function (response) {
                    $rootScope.$broadcast(EVENTS.auth.loginSuccess, response.data);
                    $state.go('app.chat');
                }, function (response) {
                    if (response.status === 422) {
                        $scope.validationErrors = response.data;
                    }
                });
            };
        });

})();
