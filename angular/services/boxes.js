(function () {
    "use strict";

    angular.module('app.services')
        .factory('BoxesService', function (Restangular) {
            var service = this,
                Boxes = Restangular.all('boxes');

            service.submit = function (formData) {
                return Boxes.post(formData);
            };
            service.remove = function (id) {
                return Boxes.customDELETE(id);
            };
            service.getBoxes = function (username, page) {
                return Boxes.getList({
                    username: username,
                    page: page
                });
            };

            return service;
        });

})();
