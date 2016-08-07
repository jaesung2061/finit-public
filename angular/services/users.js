(function () {
    "use strict";

    angular.module('app.services')
        .factory('UsersService', function (Restangular) {
            var service = this;
            var Users = Restangular.all('users');

            service.createTempAccount = function (username) {
                return Restangular.all('users/temp').post({username: username});
            };

            return service;
        });

})();
