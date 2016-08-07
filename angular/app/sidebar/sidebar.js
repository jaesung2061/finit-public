(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('SidebarCtrl', function ($rootScope, $scope, $state, $timeout, EVENTS, FriendsService, NotificationsService, ChatService, Restangular, ToastService) {
            $scope.list = 'chat';
            $scope.friends = [];
            $scope.friendRequests = [];
            $scope.notifications = [];
            $scope.chatrooms = ChatService.getChatrooms();
            $scope.unread_messages = ChatService.unread_messages;

            $scope.$on(EVENTS.friends.friendListReceived, function (e, data) {
                $scope.friends = data;
            });
            $scope.$on(EVENTS.friends.requestListReceived, function (e, data) {
                $scope.friendRequests = data;
            });
            $scope.$on(EVENTS.notifications.notificationsReceived, function (e, data) {
                $scope.notifications = data;
            });
            $scope.$on(EVENTS.auth.logoutSuccess, function () {
                $scope.friends = [];
                $scope.friendRequests = [];
                $scope.notifications = [];
            });

            /**
             * Change active list on sidebar
             *
             * @param list
             */
            $scope.changeList = function (list) {
                $scope.list = list;

                if (list === 'notifications' && $scope.notifications.meta.current_page === $scope.notifications.meta.last_page) {
                    markNotificationsAsRead();
                }
            };
            /**
             * Accept friend
             *
             * @param userId
             */
            $scope.acceptRequest = function (userId) {
                FriendsService.acceptRequest(userId);
            };
            /**
             * Decline friend
             *
             * @param userId
             */
            $scope.declineRequest = function (userId) {
                FriendsService.declineRequest(userId);
            };
            /**
             * Get next set of notifications
             */
            $scope.getNotifications = function () {
                // For previous notifications
                var promise = markNotificationsAsRead();

                if ($scope.notifications.meta.current_page < $scope.notifications.meta.last_page) {
                    // We need to wait for http request (to update notifications as read)
                    // to finish. Should be using promises but whatever.
                    promise.then(function () {
                        NotificationsService.getNotifications().then(function () {
                            // If last page, automatically mark them as read
                            if ($scope.notifications.meta.current_page === $scope.notifications.meta.last_page) {
                                markNotificationsAsRead();
                            }
                        });
                    });
                }
            };
            /**
             * When user clicks on notification, do correct action
             *
             * @param notification
             * @return promise
             */
            $scope.notificationAction = function (notification) {
                tryCatch(function () {
                    notification.data = JSON.parse(notification.data);
                });

                switch (notification.event) {
                    case 1: // FRIEND_REQUEST_RECEIVED
                    case 2: // FRIEND_REQUEST_ACCEPTED
                        $state.go('app.profile', {username: notification.source.username});
                        break;
                    case 3: // CHAT_INVITE_PRIVATE_RECEIVED
                        break;
                    case 4: // CHAT_INVITE_PROTECTED_RECEIVED
                        Restangular.all('chatrooms').get(notification.data.chatroom.channel).then(function (response) {
                            if (response.data) {
                                var chatroom = new ChatService.createChatroom({
                                    type: 'protected',
                                    title: response.data.title,
                                    channel: response.data.channel
                                });
                                $state.go('app.chat.show', {title: chatroom.channel.substr(3)});
                            } else {
                                ToastService.show('Something went wrong!');
                                $state.go('app.chat');
                            }
                        });
                        break;
                    case 5: // CHAT_INVITE_PUBLIC_RECEIVED
                        //$state.go('app.chat.show', {title: notification.data.chatroom_title});
                        break;
                    case 6: // BOX_RECEIVED
                        $state.go('app.profile', {username: $rootScope.currentUser.username});
                        break;
                    case 7: // BOX_COMMENT_RECEIVED
                    case 8: // BOX_LIKED
                        $state.go('app.profile', {username: notification.source.username});
                        break;
                    case 9: // CHAT_MESSAGE_LIKED
                        break;
                    case 10: // PRIVATE_MESSAGE_RECEIVED
                        $state.go('app.chat.show', {title: '@' + notification.source.username});
                        break;
                    case 11: // BANNED_FROM_CHANNEL
                        break;
                    case 12: // UNBANNED_FROM_CHANNEL
                        break;
                }
            };

            function markNotificationsAsRead() {
                var promise;
                for (var i = 0; i < $scope.notifications.length; i++) {
                    promise = Restangular.one('notifications', $scope.notifications[i].id).patch({is_read: true});
                    $scope.notifications.meta.total--;
                }

                // Promise for the most recent http request
                return promise;
            }
        });

})();