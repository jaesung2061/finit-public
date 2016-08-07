(function () {
    "use strict";

    angular.module('app.config')
        .config(function (RestangularProvider) {
            RestangularProvider
                .setBaseUrl('/api/')
                .setDefaultHeaders({accept: "application/x.laravel.v1+json"});

            RestangularProvider.addResponseInterceptor(function (response, operation, what, url) {
                var extractedData = response;

                if (url === '/api/messages') {
                    return response.data;
                }

                if (operation === 'getList') {
                    if (response.data.constructor === Array) {
                        extractedData = response.data;
                    } else if (response.data.data && response.data.current_page) {
                        // Response is paginated
                        extractedData = response.data.data;
                        extractedData.meta = {
                            current_page: response.data.current_page,
                            from: response.data.from,
                            last_page: response.data.last_page,
                            per_page: response.data.per_page,
                            to: response.data.to,
                            total: response.data.total
                        };
                    }
                }

                return extractedData;
            });
        })
        .run(function ($rootScope, Restangular, EVENTS) {
            //Restangular.setErrorInterceptor(function (response, deferred, responseHandler) {
            //    switch (response.status) {
            //        case 401:
            //        case 403:
            //            $rootScope.$broadcast(EVENTS.auth.logoutSuccess);
            //            break;
            //    }
            //
            //    return deferred;
            //});
        });

})();
