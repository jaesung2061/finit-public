(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('CreateRoomController', function ($rootScope, $scope, Restangular, ChatService, $state) {
            $scope.formData = {type: 'protected'};

            $scope.$watch('formData.auth.invite', function (newValue) {
                if (newValue === false) {
                    delete $scope.formData.invitePermissions;
                }
            });
            $scope.$watch('formData.auth.anyone', function (newValue) {
                if (newValue === true) {
                    delete $scope.formData.auth.friends;
                    delete $scope.formData.auth['friends-of-friends'];
                    delete $scope.formData.auth.invite;
                }
            });
            $scope.$watch('formData.auth.friends', function (newValue) {
                if (newValue === true) {
                    delete $scope.formData.auth.anyone;
                }
            });
            $scope.$watch('formData.auth[\'friends-of-friends\']', function (newValue) {
                if (newValue === true) {
                    delete $scope.formData.auth.anyone;
                    $scope.formData.auth.friends = true;
                }
            });
            $scope.$watch('formData.auth.invites', function (newValue) {
                if (newValue === true) {
                    delete $scope.formData.auth.anyone;
                    $scope.formData.auth.friends = true;
                }
            });

            $scope.submit = function () {
                if (!$scope.formData.auth.invite)
                    delete $scope.formData.invitePermissions;

                Restangular.all('chatrooms').post($scope.formData).then(function (response) {
                    delete response.data.created_at;
                    delete response.data.updated_at;

                    response.data.type = 'protected';
                    ChatService.createChatroom({
                        type: 'protected',
                        title: response.data.title,
                        channel: response.data.channel
                    });

                    $state.go('app.chat.show', {title: response.data.channel.substr(3)});
                }, function (response) {
                    $scope.errors = response.data;
                });
            };
        });

})();
