(function(){
    "use strict";

    angular.module('app.controllers')
        .controller('ForgotPasswordResetController', function ($scope, $state, Restangular, $stateParams, ToastService) {

            $scope.formData = {};


            Restangular.all('reset/password').get($stateParams.token).then(function (response) {
                $scope.formData.email = response.data.email;
            }, function () {
                $scope.tokenExpired = true;
            });

            $scope.submit = function (formData) {
                if (!$scope.submitting) {
                    $scope.submitting = true;

                    formData.token = $stateParams.token;
                    Restangular.all('forgot/password/reset').post(formData).then(function (response) {
                        $scope.submitting = false;
                        ToastService.show('Your password has been reset');
                        $state.go('app.login');
                    }, function (response) {
                        $scope.submitting = false;
                        $scope.errors = response.data;
                    })
                }
            };

            //
        });

})();
