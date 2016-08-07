(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('FriendButtonsController', function ($rootScope, $scope, FriendsService, WebSocketsService, Helpers) {

            Helpers.whenCtrlReady(function () {
                var off = $scope.$watch('user', function () {
                    if ($scope.user) {
                        getFriendLink();
                        off();
                    }
                });
            });

            $scope.$on(WebSocketsService.notificationEvent, function (event, notification) {
                if (notification.event === 1 || notification.event === 2) {
                    getFriendLink();
                }
            });

            $scope.sendRequest = function (userId) {
                FriendsService.sendRequest(userId).then(function () {
                    $scope.friendRequestSent = true;
                });
            };
            $scope.acceptRequest = function (userId) {
                FriendsService.acceptRequest(userId).then(function () {
                    $scope.isFriend = true;
                    $scope.friendRequestReceived = false;
                });
            };
            $scope.declineRequest = function (userId) {
                FriendsService.declineRequest(userId).then(function () {
                    $scope.friendRequestReceived = false;
                });
            };
            $scope.cancelRequest = function (userId) {
                FriendsService.cancelRequest(userId).then(function () {
                    $scope.friendRequestSent = false;
                });
            };
            $scope.openDialog = function (template) {
                $rootScope.openDialog(template);
            };

            function getFriendLink() {
                if ($scope.user.id === $rootScope.currentUser.id) {
                    $scope.isSelf = true;
                    $scope.isFriend = false;
                    $scope.friendRequestReceived = false;
                    $scope.friendRequestSent = false;
                } else {
                    $scope.isSelf = false;

                    FriendsService.getFriendLink($scope.user.id).then(function (response) {
                        var friendLink = response.data;

                        if (!friendLink) {
                            $scope.isFriend = false;
                            $scope.friendRequestReceived = false;
                            $scope.friendRequestReceived = false;
                        } else if (friendLink.status === 1) {
                            $scope.isFriend = false;
                            // Friend-link not complete
                            if (friendLink.accepter_id === $rootScope.currentUser.id) {
                                // Current user received request
                                $scope.friendRequestReceived = true;
                            } else {
                                // current user sent request
                                $scope.friendRequestSent = true;
                            }
                        } else if (friendLink.status === 2) {
                            // Friend-link complete
                            $scope.isFriend = true;
                        }
                    });
                }
            }
        });

})();
