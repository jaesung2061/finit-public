(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('BugReportsController', function ($scope, Restangular) {
            Restangular.all('bug-reports').getList().then(function (response) {
                $scope.bugReports = response;
            });
        });

})();
