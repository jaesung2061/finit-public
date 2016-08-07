(function(){
    "use strict";

    angular.module('app.controllers')
        .controller('ErrorController', function ($scope, $stateParams) {
            $scope.message = $stateParams.message;
        });

})();
