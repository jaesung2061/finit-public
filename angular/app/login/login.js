(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('LoginCtrl', function ($rootScope, $scope, AuthService) {

            // For testing...
            if (Finit.environment === 'local') {
                $scope.loginFormData = {password: 'secret'};

                if (Finit.agent.isIphone) {
                    $scope.loginFormData.email = 'jane@doe.com';
                } else if (Finit.agent.isIpad) {
                    $scope.loginFormData.email = 'john@doe.com';
                }
            } else {
                $scope.loginFormData = {};
            }

            $scope.login = function (loginFormData) {
                AuthService.login(loginFormData).then(function (response) {
                    if (response.status === 401) {
                        $scope.validationErrors = {
                            error: ['We couldn\'t find a match for your email/password.']
                        };
                    }
                });
            };
        });

})();
