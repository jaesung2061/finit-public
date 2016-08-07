(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('InviteDialogController', function ($scope, Restangular, DialogService, ToastService, FriendsService) {
            var Invites = Restangular.all('invites');
            var splitName;

            $scope.friends = FriendsService.friends.slice(0);
            $scope.filter = {};

            $scope.sendInvites = function () {
                var invites = [];

                for (var i = 0; i < $scope.friends.length; i++) {
                    if ($scope.friends[i].invited) {
                        invites.push($scope.friends[i].id);
                        delete $scope.friends[i].invited;
                    }
                }

                Invites.post({
                    invites: invites,
                    chatroom_channel: $scope.chatroom.channel,
                    chatroom_title: $scope.chatroom.title,
                    chatroom_suffix: $scope.chatroom.suffix,
                    chatroom_type: $scope.chatroom.type
                }).then(function (response) {
                    ToastService.show('Invite have been sent');
                    $scope.hide();
                });
            };
            $scope.filterFriends = function (name) {
                $scope.filter.username = name.replace('@', '');
            };
            $scope.hide = function () {
                DialogService.hide();
            };

        });

})();
