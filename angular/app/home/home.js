(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('HomeController', function ($rootScope, $scope, $state, EVENTS, Restangular, Session) {


            // NOT USING THIS FOR NOW
            // URL `/` GOES TO STATE `APP.CHAT`


            //var Users = Restangular.all('users');
            //
            //$scope.joinChat = function (joinFormData) {
            //    if (!$rootScope.currentUser && Session.authRequestComplete) {
            //        Users.all('temp').post({username: joinFormData.username}).then(function (response) {
            //            $rootScope.$broadcast(EVENTS.auth.loginSuccess, response.data);
            //            $state.go('app.chat.show', {title: joinFormData.hashtag});
            //        }, function (error) {
            //            //
            //        });
            //    } else {
            //        $state.go('app.chat.show', {title: joinFormData.hashtag});
            //    }
            //};
        });

})();
