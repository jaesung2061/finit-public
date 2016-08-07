(function () {
    "use strict";

    angular.module("app.services")
        .factory('Session', function (/*Facebook*/) {
            var service = this;
            service.token = null;
            service.user = null;
            service.authRequestSent = false;
            service.authRequestComplete = false;
            service.facebook = {};

            // Check login status for facebook
            //Facebook.getLoginStatus(function (response) {
            //    service.facebook.loginStatus = response.status;
            //    if (service.facebook.loginStatus === 'connected')
            //        service.facebook.token = response.authResponse.userID;
            //});

            service.create = function (token, user) {
                service.token = token;
                service.user = user;
            };
            service.getToken = function () {
                return service.token;
            };
            service.isAuthenticated = function () {
                return !!service.token;
            };
            service.destroy = function () {
                service.authRequestSent = false;
                return service.token = null;
            };

            return service;
        });
})();