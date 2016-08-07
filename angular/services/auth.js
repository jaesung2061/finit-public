(function () {
    "use strict";

    angular.module("app.services")
        .factory('AuthService', function ($rootScope,
                                          $state,
                                          $http,
                                          EVENTS,
                                          Session,
                                          //Facebook,
                                          Restangular) {
            var service = this,
                Auth = Restangular.all('auth');

            /**
             * Log in user
             *
             * @param formData
             * @returns {*}
             */
            service.login = function (formData) {
                return Auth.customPOST(formData).then(function (response) {
                    $rootScope.$broadcast(EVENTS.auth.loginSuccess, response);
                    $state.go('app.chat');
                    return response;
                }, function (response) {
                    $rootScope.$broadcast(EVENTS.auth.loginFailed);
                    return response;
                });
            };
            /**
             *
             * @returns {*}
             */
            service.authenticate = function (token) {
                return Restangular.all('auth').customGET(null, {token: token}).then(function (response) {
                    $rootScope.$broadcast(EVENTS.auth.loginSuccess, response);
                    return response.data;
                }, function (response) {
                    $rootScope.$broadcast(EVENTS.auth.loginFailed);
                    return response;
                });
            };
            /**
             * Log out user
             *
             * @returns {*}
             */
            service.logout = function () {
                return Auth.customDELETE().then(function () {
                    $rootScope.$broadcast(EVENTS.auth.logoutSuccess, {forceStateHome: true});
                    $state.go('app.login');
                });
            };
            /**
             * Check if user is authenticated
             *
             * @returns {boolean}
             */
            service.isAuthenticated = function () {
                return !!Session.user;
            };

            return service;
        });
})();