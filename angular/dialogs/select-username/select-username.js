(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('SelectUsernameDialogController', function ($rootScope, $scope, DialogService, Restangular, EVENTS, $state, channel) {

            $scope.save = function (username) {
                if (!username) return;

                if (!/^[a-zA-Z0-9-_]+$/.test(username)) {
                    $scope.errors = {username: ['Username must be alphanumeric, dash and/or underscore.']};
                }

                Restangular.all('users/temp').post({username: username}).then(function (response) {
                    // Set intended state so loginSuccess event hander routes to correct state
                    $rootScope.$broadcast(EVENTS.auth.loginSuccess, response.data);
                    $state.go('app.chat.show', {title: channel});
                    $scope.hide('success');
                }, function (response) {
                    $scope.errors = response.data;
                });
            };

            $scope.hide = function (type) {
                if (type !== 'success') {
                    $state.go('app.home');
                }
                DialogService.hide();
            };

        });

})();
