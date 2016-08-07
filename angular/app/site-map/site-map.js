(function(){
    "use strict";

    angular.module('app.controllers')
        .controller('SiteMapController', function ($scope, Restangular) {
            Restangular.all('site-map').getList().then(function (response) {
                $scope.chatrooms = response;
            });
            //
        });

})();
