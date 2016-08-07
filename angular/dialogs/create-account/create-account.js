(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('CreateAccountDialogController', function ($rootScope, $scope, $state, $stateParams, $timeout, $localStorage, ToastService, DialogService, Restangular, ChatService, EVENTS) {
            var Users = Restangular.all('users');
            var toState = $state.current.name;
            var toParams = clone($stateParams);

            $scope.formData = {
                username: $rootScope.currentUser.username
            };

            $scope.submit = function () {
                $scope.formData.tempToPerm = true;
                $scope.formData.currentAccountId = $rootScope.currentUser.id;

                Users.post($scope.formData).then(function (response) {
                    $rootScope.$broadcast(EVENTS.auth.logoutSuccess, {noStateChange: true});
                    ToastService.show('Your account has been created!');
                    $scope.hide();
                    $rootScope.$broadcast(EVENTS.auth.loginSuccess, response.data);
                    $timeout(function () {
                        $state.go(toState, toParams, {reload: true})
                    }, 20);
                }, function (response) {
                    $scope.errors = response.data;
                });
            };

            $scope.hide = function () {
                DialogService.hide();
            };

        });

})();
