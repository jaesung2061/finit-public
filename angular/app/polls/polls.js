(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('PollsController', function ($scope, Restangular, $stateParams, Helpers, PollsService) {
            $scope.title = $stateParams.title;

            Helpers.whenCtrlReady(function () {
                Restangular.all('polls').getList({
                    suffix: $stateParams.title.toLowerCase(),
                    perPage: 8
                }).then(function (response) {
                    for (var i = 0; i < response.length; i++) {
                        response[i] = PollsService.calculatePercentages(response[i]);
                    }
                    $scope.polls = response;
                });
            });

            $scope.changePage = function (direction) {
                var nextPage;

                if (direction === 'next' && $scope.polls.meta.current_page < $scope.polls.meta.last_page)
                    nextPage = $scope.polls.meta.current_page + 1;
                else if (direction === 'previous' && $scope.polls.meta.current_page > 1)
                    nextPage = $scope.polls.meta.current_page - 1;
                else return;

                $scope.polls.meta.current_page = nextPage;

                PollsService.getPoll({
                    suffix: $stateParams.title.toLowerCase(),
                    pollMeta: $scope.polls.meta
                }, 8).then(function (response) {
                    for (var i = 0; i < response.length; i++) {
                        response[i] = PollsService.calculatePercentages(response[i]);
                    }
                    $scope.polls = response;
                });
            }
        });

})();
