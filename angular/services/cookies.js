(function () {
    "use strict";

    angular.module('app.services')
        .factory('CookiesService', function () {
            var service = this;

            /**
             * Create a cookie. If no days is set,
             * cookie lasts for session.
             *
             * @param name
             * @param value
             * @param days
             */
            service.create = function (name, value, days) {
                var expires;

                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                    expires = "; expires=" + date.toUTCString();
                } else {
                    expires = "";
                }
                document.cookie = name + "=" + value + expires + "; path=/";
            };
            /**
             * Get cookie
             *
             * @param name
             * @returns {*}
             */
            service.get = function (name) {
                var nameEQ = name + "=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
                }
                return null;
            };
            /**
             * Remove cookie
             *
             * @param name
             */
            service.remove = function (name) {
                service.create(name, "", -1);
            };

            return service;
        });

})();
