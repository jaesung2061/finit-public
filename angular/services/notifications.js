(function () {
    "use strict";

    angular.module('app.services')
        .factory('NotificationsService', function ($rootScope, $state, EVENTS, Restangular, ToastService, WebSocketsService, FriendsService, ChatService) {
            var service = this,
                Notifications = Restangular.all('notifications');

            service.notifications = [];

            $rootScope.$on(EVENTS.auth.logoutSuccess, function () {
                service.notifications = [];
            });
            $rootScope.$on(WebSocketsService.notificationEvent, function (e, notification) {
                var data;

                tryCatch(function () {
                    data = JSON.parse(notification.data);
                });

                service.getNotifications();

                switch (notification.event) {
                    case 1:
                        FriendsService.getFriendRequests();
                        ToastService.show(notification.event_info);
                        break;
                    case 2:
                        FriendsService.getFriendRequests();
                        FriendsService.getCurrentUsersFriends();
                        ToastService.show(notification.event_info);
                        break;
                    case 3:
                        //ToastService.show(source + ' has invited you to chat.');
                        //expression = 'App.joinPrivateRoom(' + JSON.stringify(JSON.parse(data.data)) + ', \'' + data.source.username + '\')';
                        break;
                    case 4:
                        ToastService.show(notification.event_info, 'JOIN').then(function (e) {
                            Restangular.all('chatrooms').get(notification.data.chatroom.channel).then(function (response) {
                                if (response.data) {
                                    var chatroom = new ChatService.createChatroom({
                                        type: 'protected',
                                        title: response.data.title,
                                        channel: response.data.channel
                                    });
                                    $state.go('app.chat.show', {title: chatroom.channel.substr(3)})
                                } else {
                                    ToastService.show('Something went wrong!');
                                    $state.go('app.chat');
                                }
                            });
                        });
                        break;
                    case 5:
                        ToastService.show(notification.event_info, 'JOIN').then(function (e) {
                            if (e === 'ok') {
                                $state.go('app.chat.show', {channel: data.channel});
                            }
                        });
                        break;
                    case 6:
                    case 7:
                    case 8:
                        //expression = 'App.goToState(\'profile\', {username: \'' + $rootScope.currentUser.username + '\'})';
                        break;
                    case 9:
                        break;
                    case 10:
                        if ($rootScope.currentUser.mutedUsers && $rootScope.currentUser.mutedUsers.indexOf(notification.source_id) > -1) return;

                        var chatroom = ChatService.createChatroom({
                            type: 'private',
                            user: notification.source,
                            title: '@' + notification.source.username
                        });
                        chatroom.unread_messages_count++;
                        ChatService.updateUnreadMessagesTotal();

                        if ($rootScope.currentUser.mutedUsers && $rootScope.currentUser.mutedUsers.indexOf(notification.source.id) === -1) {
                            ToastService.show(notification.event_info, 'JOIN').then(function (e) {
                                if (e === 'ok') {
                                    $state.go('app.chat.show', {title: '@' + notification.source.username});
                                }
                            });
                        } else {
                            Restangular.one('notifications', notification.id).patch();
                        }
                        break;
                    case 11:
                        break;
                    case 12:
                    case 13:
                    case 14:
                        ToastService.show(notification.event_info, 'OK');
                        break;
                }

            });

            service.getNotifications = function () {
                return Notifications.getList().then(function (response) {
                    $rootScope.$broadcast(EVENTS.notifications.notificationsReceived, response);
                    return response;
                });
            };
            service.getNextNotifications = function (page) {
                return Notifications.getList({page: page});
            };
            service.clearData = function () {
                _.remove(service.notifications);
            };

            return service;
        });

})();
