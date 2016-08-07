(function(){
    "use strict";

    angular.module('app.controllers')
        .controller('AccountsDialogController', function ($rootScope, $scope, $state, Restangular, DialogService, UsersService, EVENTS, channel) {
            $scope.tab = 'username';
            $scope.formData = {};
            $scope.loginFormData = {};

            $scope.selectUsernameAndJoin = function (formData) {
                UsersService.createTempAccount(formData.username).then(function (response) {
                    $rootScope.$broadcast(EVENTS.auth.loginSuccess, response.data);
                    $state.go('app.chat.show', {title: channel});
                    $scope.hide();
                }, function (response) {
                    $scope.errors = response.data;
                });
            };

            $scope.loginAndJoin = function (formData) {
                Restangular.all('auth').customPOST({
                    email: formData.email,
                    password: formData.password
                }).then(function (response) {
                    $rootScope.$broadcast(EVENTS.auth.loginSuccess, response);
                    $state.go('app.chat.show', {title: channel});
                    $scope.hide();
                }, function (response) {
                    $scope.errors = {error: ['We couldn\'t find a match for your username/password.']};
                });
            };

            $scope.goToForgotPasswordPage = function () {
                $state.go('app.forgot-password');
                $scope.hide();
            };

            $scope.hide = function (reason) {
                DialogService.hide();
                if (reason === 'cancel')
                    $state.go('app.home');
            };

            $scope.changeTab = function (tab) {
                $scope.tab = tab;
            };

        });

})();
