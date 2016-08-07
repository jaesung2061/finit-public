(function(){
    "use strict";

    angular.module('app.controllers')
        .controller('UnsubscribeController', function ($scope, $http, $state, ToastService) {
            $scope.email = '';

            $scope.submit = function () {
                $http({
                    method: 'post',
                    url: '/api/users/unsubscribe',
                    data: {email: $scope.email}
                }).then(function (response) {
                    $scope.email = '';
                    $state.go('app.home');
                    ToastService.show('You are now unsubscribed.')
                }, function () {
                    ToastService.error('Couldn\'t find the email address.')
                });
            };
        });

})();
