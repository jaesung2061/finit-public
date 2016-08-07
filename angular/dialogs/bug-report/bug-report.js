(function(){
    "use strict";

    angular.module('app.controllers')
        .controller('BugReportDialogController', function ($scope, DialogService, Restangular, ToastService) {
            var BugReports = Restangular.all('bug-reports');

            $scope.formData = {};

            $scope.submit = function () {
                if (!$scope.formData.body) return;

                BugReports.post($scope.formData).then(function (response) {
                });

                ToastService.show('Thank you for reporting.');

                $scope.hide();
            };

            $scope.hide = function () {
                DialogService.hide();
            };

        });

})();
