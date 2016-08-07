(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('EmailResetController', function ($rootScope, $scope, $http, $state, $stateParams, ToastService) {
            $scope.email_new = null;
            $scope.user = null;
            $scope.resetNotFound = false;

            $http.get('/api/reset/email/' + $stateParams.token).success(function (response) {
                $scope.email_new = response.data.email_new;
                $scope.user = response.data.user;
            }).error(function () {
                $scope.resetNotFound = true;
            });

            $scope.submit = function () {
                if (!$scope.submitting) {
                    $scope.submitting = true;

                    $http.post('/api/reset/email/' + $stateParams.token, {}).success(function (response) {
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
