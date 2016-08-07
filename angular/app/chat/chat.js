(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('ChatController', function ($rootScope, $scope, $state, Restangular, ChatService, FavoritesService, WebSocketsService, DialogService, ToastService, UsersService, Helpers, EVENTS) {
            $scope.channels = [
                {suffix: 'random', member_count: 10},
                {suffix: 'nba', member_count: 10},
                {suffix: 'nfl', member_count: 10},
                {suffix: 'nhl', member_count: 10},
                {suffix: 'mlb', member_count: 10}
            ];
            $scope.subscribedChatrooms = ChatService.getChatrooms();
            $scope.joinFormData = {};

            Helpers.whenCtrlReady(initializeController);

            Restangular.all('chatrooms').getList().then(function (response) {
                //_.remove(response, {title: 'finit'});
                var finit = _.find(response, {title: 'finit'});

                // Make it uppercase :)
                if (finit) finit.title = 'Finit';

                response = _.unique(response, 'title');

                response = _.filter(response, function (item) {
                    return item.member_count;
                });

                $scope.savedChatrooms = response;
            });

            $scope.joinChat = function (formData) {
                if (!$rootScope.currentUser) {
                    UsersService.createTempAccount(formData.username).then(function (response) {
                        $rootScope.$broadcast(EVENTS.auth.loginSuccess, response.data);
                        $state.go('app.chat.show', {title: formData.channel.replace('#', '')});
                        $scope.errors = null;
                    }, function (response) {
                        $scope.errors = response.data;
                    });
                } else {
                    $state.go('app.chat.show', {title: formData.channel.replaceAll({'#': ''})});
                }
            };
            $scope.joinChatByClick = function (channel) {
                if (!$rootScope.currentUser) {
                    DialogService.fromTemplate('accounts', null, {
                        clickOutsideToClose: false,
                        locals: {channel: channel}
                    });
                } else {
                    $state.go('app.chat.show', {title: channel});
                }
            };
            $scope.leaveChat = function (chatroom) {
                WebSocketsService.unsubscribe(chatroom.channel);
                ChatService.removeChatroom(chatroom);
                FavoritesService.removeFavorite(chatroom);
            };

            function initializeController() {
                if ($rootScope.currentUser && !$rootScope.currentUser.is_temp) {
                    FavoritesService.getFavorites().then(function (response) {
                        $scope.favorites = response;
                    });
                }
            }
        });

})();
