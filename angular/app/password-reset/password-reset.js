(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('PasswordResetController', function ($rootScope, $scope, $http, $state, $stateParams, ToastService) {
            $scope.password_new = null;
            $scope.user = null;
            $scope.resetNotFound = false;

            $http.get('/api/reset/password/' + $stateParams.token).success(function (response) {
                $scope.password_new = response.data.password_new;
                $scope.user = response.data.user;
            }).error(function () {
                $scope.resetNotFound = true;
            });

            $scope.submit = function () {
                if (!$scope.submitting) {
                    $scope.submitting = true;

                    $http.post('/api/reset/password/' + $stateParams.token, {}).success(function (response) {
                        $scope.submitting = false;
                        ToastService.show(response);

                        if (!$rootScope.currentUser) {
                            $state.go('app.login');
                        } else {
                            $state.go('app.chat');
                        }
                    }).error(function (response) {
                        $scope.submitting = false;
                        $scope.errors = response.data;
                        $state.go('home');
                    });
                }
            };
        });

})();
