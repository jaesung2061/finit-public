(function () {
    "use strict";

    angular.module('app.services')
        .factory('FriendsService', function ($rootScope, $timeout, Restangular, EVENTS, WebSocketsService, ToastService, DialogService) {
            var service = this,
                Friends = Restangular.all('friends');

            service.friends = [];
            service.requests = [];

            $rootScope.$on(EVENTS.auth.logoutSuccess, function () {
                service.friends = [];
                service.requests = [];
            });
            $rootScope.$on(WebSocketsService.connectionSuccessEvent, function () {
                if (service.friends.length === 0) {
                    var off = $rootScope.$on(EVENTS.friends.friendListReceived, function (e, data) {
                        off();
                        getOnlineFriends(data);
                    });
                } else {
                    getOnlineFriends(service.friends);
                }
            });
            $rootScope.$on(WebSocketsService.presenceEvent, function (event, data) {
                $timeout(function () {
                    switch (data.event) {
                        case 'online-friends':
                            return setIsOnlineAttributes(data.friendIds);
                        case 'client-connected':
                            return setIsOnlineAttribute(data.userId);
                        case 'client-disconnected':
                            return unsetIsOnlineAttribute(data.userId);
                    }
                });
            });

            /**
             * Get current user's friends
             *
             * @returns {*}
             */
            service.getCurrentUsersFriends = function () {
                return Friends.getList().then(function (response) {
                    $rootScope.$broadcast(EVENTS.friends.friendListReceived, response);
                    service.friends = response;

                    if (WebSocketsService.connected)
                        WebSocketsService.getOnlineFriends();

                    return response;
                });
            };
            /**
             * Get friends
             *
             * @param userId
             * @returns {*}
             */
            service.getFriends = function (userId) {
                return Friends.getList({userId: userId});
            };
            /**
             * Get friend requests
             *
             * @returns {*}
             */
            service.getFriendRequests = function () {
                return Friends.all('requests').getList().then(function (response) {
                    $rootScope.$broadcast(EVENTS.friends.requestListReceived, response);

                    return response;
                });
            };
            /**
             * Get mutual friends of current user and provided user
             *
             * @param userId
             * @returns {*}
             */
            service.getMutualFriends = function (userId) {
                return Restangular.one('friends', userId).one('mutual').getList();
            };
            /**
             * Get friend pivot
             *
             * @param userId
             * @returns {*}
             */
            service.getFriendLink = function (userId) {
                return Restangular.one('friends', userId).get();
            };
            /**
             * Check if user is friend
             *
             * @param userId
             * @returns {boolean}
             */
            service.checkIfFriend = function (userId) {
                return !!_.find(service.friends, {id: userId});
            };
            /**
             * Request friend
             *
             * @param userId
             * @param message
             */
            service.sendRequest = function (userId, message) {
                return Friends.post({userId: userId, type: 'initiate'}).then(function (response) {
                    service.getCurrentUsersFriends();

                    if (message)
                        ToastService.show(message);

                    return response;
                }, function (response) {
                    if (response.status === 409) {
                        DialogService.confirm(
                            'You have already received a request from this user.',
                            'Would you like to accept?'
                        ).then(function (confirmation) {
                            if (confirmation) {
                                service.acceptRequest(userId).then(function () {
                                    ToastService.show('Friend request accepted.');
                                });
                            }
                        });
                    }
                    if (response.status === 403) {
                        ToastService.error('This user is a guest or has muted you.');
                    }

                    return response;
                });
            };
            /**
             * Accept friend
             *
             * @param userId
             */
            service.acceptRequest = function (userId) {
                return Friends.post({userId: userId, type: 'confirm'}).then(function () {
                    service.getCurrentUsersFriends();
                    service.getFriendRequests();
                });
            };
            /**
             * Decline friend
             *
             * @param userId
             */
            service.declineRequest = function (userId) {
                Restangular.one('friends', userId).remove({type: 'accepterDeclinesRequest'}).then(function () {
                    service.getFriendRequests();
                });
            };
            /**
             * Decline friend
             *
             * @param userId
             */
            service.cancelRequest = function (userId) {
                return Restangular.one('friends', userId).remove({type: 'requesterCancelsRequest'});
            };
            /**
             * Decline friend
             *
             * @param userId
             */
            service.unfriend = function (userId) {
                Restangular.one('friends', userId).remove({type: 'unfriend'}).then(function () {
                    service.getCurrentUsersFriends();
                    service.getFriendRequests();
                });
            };
            /**
             * Clear service data
             */
            service.clearData = function () {
                _.remove(service.friends);
                _.remove(service.requests);
            };

            /**
             *
             * @param data
             */
            function setFriendIds(data) {
                service.friendIds = [];
                var length = data.length;
                for (var i = 0; i < length; i++) {
                    service.friendIds.push(data[i].id);
                }
            }

            /**
             *
             * @param friends
             */
            function getOnlineFriends(friends) {
                var friendIds = [];

                for (var i = 0; i < friends.length; i++) {
                    friendIds.push(friends[i].id);
                }

                WebSocketsService.getOnlineFriends(friendIds, friends);
            }

            /**
             * Loop through online friends list (from ws server)
             * and for each one, loop through service.friends
             * to find a match, then set isOnline to true for the match
             *
             * @param onlineFriendIds
             */
            function setIsOnlineAttributes(onlineFriendIds) {
                var friendIdsLength = service.friends.length,
                    onlineFriendIdsLength = onlineFriendIds.length,
                    i;

                for (i = 0; i < friendIdsLength; i++) {
                    delete service.friends[i].isOnline;
                }

                for (i = 0; i < onlineFriendIdsLength; i++) {
                    for (var index = 0; index < friendIdsLength; index++) {
                        if (onlineFriendIds[i] === service.friends[index].id) {
                            service.friends[index].isOnline = true;
                            break;
                        }
                    }
                }
            }

            /**
             * Same as setOnlineFriends() but for single person
             *
             * @param userId
             */
            function setIsOnlineAttribute(userId) {
                for (var i = 0; i < service.friends.length; i++) {
                    if (userId === service.friends[i].id) {
                        service.friends[i].isOnline = true;
                        break;
                    }
                }
            }

            /**
             * Unset isOnline attribute for friend in friend list
             *
             * @param userId
             */
            function unsetIsOnlineAttribute(userId) {
                for (var i = 0; i < service.friends.length; i++) {
                    if (userId === service.friends[i].id) {
                        service.friends[i].isOnline = false;
                        break;
                    }
                }
            }

            return service;
        });

})();
