(function(){
    "use strict";

    angular.module('app.controllers')
        .controller('ClaimController', function ($rootScope, $scope, $state, $stateParams, Restangular, ToastService) {
            $scope.formData = {
                type: 'claim'
            };
            $scope.hashtag = $stateParams.hashtag || '';

            $scope.claimHashtag = function (hashtag) {
                Restangular.one('chatrooms', 'pub_' + hashtag.replace('#', '')).patch({type: 'claim'}).then(function (response) {
                    $rootScope.currentUser.chatroom = response.data;
                    ToastService.show('You have claimed #' + $rootScope.currentUser.chatroom.title.replace('#', '') + '. You can now view the dashboard and make changes to the hashtag settings.', 10);
                    $state.go('app.chat.show', {title: response.data.title});
                }, function (response) {
                    ToastService.error(response.data);
                });
            };
        });

})();
