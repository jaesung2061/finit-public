(function(){
    "use strict";

    angular.module('app.controllers')
        .controller('UsersController', function ($rootScope, $scope, Restangular) {
            var Users = Restangular.all('users');

            $scope.users = [];

            Users.getList().then(function (res) {
                $scope.users = res;
            });

            $scope.query = function (page) {
                Users.getList({
                    page: page,
                    param: $scope.param
                }).then(function (res) {
                    $scope.users = res;
                });
            };
            $scope.changePage = function (direction) {
                var nextPage;

                if (direction === 'next' && $scope.users.meta.current_page < $scope.users.meta.last_page)
                    nextPage = $scope.users.meta.current_page + 1;
                else if (direction === 'previous' && $scope.users.meta.current_page > 1)
                    nextPage = $scope.users.meta.current_page - 1;
                else return;

                Users.getList({
                    page: nextPage,
                    param: $scope.param
                }).then(function (res) {
                    $scope.users = res;
                });

                scrollTo(0);
            };
        });

})();
