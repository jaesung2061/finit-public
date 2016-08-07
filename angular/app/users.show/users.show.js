(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('UsersShowController', function ($rootScope,
                                                     $scope,
                                                     $state,
                                                     $stateParams,
                                                     $mdMedia,
                                                     $timeout,
                                                     Restangular,
                                                     BoxesService,
                                                     FriendsService,
                                                     Session,
                                                     EVENTS,
                                                     Helpers) {
            var Users = Restangular.all('users'),
                Likes = Restangular.all('likes'),
                mdMedia = $mdMedia('gt-md');

            $scope.initialized = false;
            $scope.user = null;
            $scope.collapse = true;
            $scope.friends = [];
            $scope.mutualFriends = [];

            $scope.$on(EVENTS.boxes.added, function () {
                $scope.collapse = true;
            });

            angular.element(window).resize(function () {
                if (mdMedia !== $mdMedia('gt-md')) {
                    $scope.$broadcast(EVENTS.boxes.received);
                    mdMedia = !mdMedia;
                }
            });

            Helpers.whenCtrlReady(initializeController);

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
            $scope.changePage = function (direction) {
                var nextPage;

                if (direction === 'next' && $scope.boxes.meta.current_page < $scope.boxes.meta.last_page)
                    nextPage = $scope.boxes.meta.current_page + 1;
                else if (direction === 'previous' && $scope.boxes.meta.current_page > 1)
                    nextPage = $scope.boxes.meta.current_page - 1;
                else return;

                $scope.$broadcast(EVENTS.boxes.requesting);
                $scope.boxes = [];
                getBoxes(nextPage);

                scrollTo(angular.element(".profile-wall-container").position().top);
            };
            $scope.deleteBox = function (box) {
                Restangular.one('boxes', box.id).remove().then(function (response) {
                    $scope.$broadcast(EVENTS.boxes.removed, box.id);

                    _.remove($scope.boxes, {id: box.id});
                });
            };
            $scope.likeBox = function (box) {
                if (box.currentUserLiked) {
                    Likes.one('remove').remove({box_id: box.id}).then(function () {
                        box.currentUserLiked = false;
                        box.starsCount--;
                    });
                } else {
                    Likes.post({box_id: box.id}).then(function (response) {
                        box.currentUserLiked = true;
                        box.starsCount++;
                    });
                }
            };
            $scope.toggleBoxForm = function () {
                $scope.collapse = !$scope.collapse;
            };

            function initializeController() {
                if ($stateParams.username && $rootScope.currentUser && $stateParams.username === $rootScope.currentUser.username) {
                    $scope.isSelf = true;
                    $scope.user = angular.element.extend({}, $rootScope.currentUser);
                    $scope.friends = FriendsService.getFriends($scope.user.id).$object;
                    $scope.initialized = true;
                    getBoxes(1);
                } else if ($stateParams.username) {
                    Users.get($stateParams.username).then(function (response) {
                        if (response.data) {
                            $scope.user = response.data;
                            $scope.friends = FriendsService.getFriends($scope.user.id).$object;

                            getBoxes(1);

                            if ($rootScope.currentUser) {
                                FriendsService.getFriendLink($scope.user.id).then(function (response) {
                                    displayCorrectButtons(response.data);
                                });
                                FriendsService.getMutualFriends($scope.user.id).then(function (response) {
                                    $scope.mutualFriends = response;
                                    $scope.initialized = true;
                                });
                            } else {
                                $scope.initialized = true;
                            }
                        } else {
                            $state.go('app.error', {message: 'Sorry, we couldn\'t find that user.'});
                        }
                    });
                } else {
                    $state.go('app.error', {message: 'Sorry, we couldn\'t find that user.'});
                }
            }

            /**
             *
             * @param nextPage
             */
            function getBoxes(nextPage) {
                $scope.requestingBoxes = true;
                BoxesService.getBoxes($scope.user.username, nextPage).then(function (res) {
                    if (res.length === 0)
                        $scope.showBoxesPlaceholder = true;

                    $scope.boxes = res;
                    $scope.$broadcast(EVENTS.boxes.received);
                });
            }

            /**
             * We need to display the correct buttons for
             * sending/accepting/declining friend requests etc
             *
             * @param friendLink
             */
            function displayCorrectButtons(friendLink) {
                if (!friendLink) {
                    $scope.isFriend = false;
                } else if (friendLink.status === 1) {
                    // Friend-link not complete
                    if (friendLink.accepter_id === $rootScope.currentUser.id) {
                        // Current user received request
                        $scope.friendRequestReceived = true;
                    } else {
                        // current user sent request
                        $scope.friendRequestSent = true;
                    }
                } else {
                    // Friend-link complete
                    $scope.isFriend = true;
                }
            }
        });

})();
