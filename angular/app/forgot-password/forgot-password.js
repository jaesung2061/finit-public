(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('ForgotPasswordController', function ($scope, Restangular, ToastService) {
            $scope.formData = {};

            $scope.submit = function (formData) {
                if (!$scope.submitting) {
                    $scope.submitting = true;

                    Restangular.all('forgot/password/remind').post(formData).then(function (response) {
                        $scope.submitting = false;
                        $scope.resetSent = true;
                    }, function (response) {
                        $scope.submitting = false;
                        $scope.errors = {email: ['We couldn\'t find the specified email.']};
                    });
                }
            };
        });

})();
