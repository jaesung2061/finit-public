(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('ChatCommandsController', function ($scope, FACES) {
            $scope.faces = FACES;
        });

})();
