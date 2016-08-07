(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('ChatShowController', function ($rootScope
                , WebSocketsService
                , FavoritesService
                , CommandsService
                , FriendsService
                , $mdBottomSheet
                , DialogService
                , $stateParams
                , PollsService
                , ToastService
                , Restangular
                , ChatService
                , $mdSidenav
                , $timeout
                , Session
                , $filter
                , Helpers
                , Upload
                , $scope
                , $state
                , EVENTS) {
                $scope.chatrooms = ChatService.getChatrooms();
                $scope.chatroom = null;
                $scope.message = '';

                if ($stateParams.title.indexOf('@') === -1 && $stateParams.title.indexOf('_') !== 0) {
                    Restangular.all('chatrooms').get('pub_' + $stateParams.title).then(function (response) {
                        if (response.data) {
                            if (response.data.description_short) {
                                Helpers.updateMetadata({
                                    description: response.data.description_short
                                });
                            }
                            if (response.data.tab_title) {
                                Helpers.updateMetadata({
                                    title: response.data.tab_title + ' | Finit'
                                });
                            } else if ($state.is('app.chat.show') && $stateParams.title) {
                                Helpers.updateMetadata({
                                    title: '#' + $stateParams.title.capitalizeFirstLetter() + ' chat | Finit'
                                });
                            } else {
                                Helpers.updateMetadata({
                                    title: 'Finit - Hashtag Chatting'
                                });
                            }
                        }
                    });
                }

                $scope.$on('$stateChangeSuccess', function () {
                    if (!$rootScope.currentUser) {
                        Helpers.whenCtrlReady(initializeController);
                    } else {
                        initializeController();
                    }
                });
                $scope.$on('banned-from-channel', function (event, data) {
                    $scope.leaveRoom(data.chatroom);
                });
                $scope.$on('change-chatrooms', function (e, data) {
                    $mdSidenav('left').close();
                    if (data.constructor === ChatService.Chatroom.constructor) {
                        changeRoom(data);
                    } else {
                        var chatroom = ChatService.findChatroom(data);

                        if (chatroom) {
                            changeRoom(chatroom);
                        } else {
                            if (data.channel && (data.channel.indexOf('pub_') === 0 || data.channel.indexOf('pro_') === 0)) {
                                Restangular.all('chatrooms').get(data.channel).then(function (response) {
                                    joinCorrectRoom(response.data.title);
                                });
                            } else if (data.title) {
                                joinCorrectRoom(data.title);
                            }
                        }
                    }
                });
                $scope.$on('leave-chatroom', function (event, data) {
                    $scope.leaveRoom(data || $scope.chatroom);
                });
                $scope.$on(WebSocketsService.disconnectionEvent, function () {
                    var off = $rootScope.$on(WebSocketsService.connectionSuccessEvent, function () {
                        off();
                        $rootScope.$broadcast(EVENTS.chat.messagesReceived, $scope.chatroom, true);
                    });
                });
                $scope.$on('refreshed-members', function (event, data) {
                    var chatroom = ChatService.findChatroom({channel: data.channel});
                    chatroom.members = _.uniq(data.members, function (member, key, a) {
                        return member.id;
                    });
                    chatroom.members.sort(function (a, b) {
                        var aIsMod = a.mod_powers.indexOf(chatroom.channel) > -1;
                        var bIsMod = b.mod_powers.indexOf(chatroom.channel) > -1;

                        if (aIsMod && !bIsMod)
                            return -1;

                        if (!aIsMod && bIsMod)
                            return 1;

                        if (aIsMod && bIsMod) {
                            if (a.username.toLowerCase() > b.username.toLowerCase())
                                return 1;

                            if (a.username.toLowerCase() < b.username.toLowerCase())
                                return -1;

                            return 0;
                        }

                        if (a.username.toLowerCase() > b.username.toLowerCase())
                            return 1;

                        if (a.username.toLowerCase() < b.username.toLowerCase())
                            return -1;

                        return 0;
                    });

                    ToastService.show('Refreshed members list for ' + chatroom.title);
                });

                /**
                 * Send chat message
                 *
                 * @param chatroom
                 */
                $scope.sendMessage = function (chatroom) {
                    $scope.message = $scope.message.trim();

                    if ($scope.message === '' || $scope.message === null) {
                        return false;
                    } else if (CommandsService.test($scope.message)) {
                        CommandsService.execute($scope.message, chatroom);
                    } else {
                        WebSocketsService.sendMessage(chatroom.channel, $scope.message);

                        var date = new Date();
                        var message = {
                            body: $scope.message,
                            sender: $rootScope.currentUser,
                            created_at: $filter('date')(date, 'shortTime'),
                            timestamp: date.getTime()
                        };
                        var appendTo = chatroom.pushMessage(message);

                        $rootScope.$broadcast(EVENTS.chat.messageSent, chatroom, message, appendTo);

                        $('#chat-message-input').trigger('focus');
                    }

                    $scope.message = '';
                };
                /**
                 *
                 * @param $event
                 */
                $scope.onChatKeyPress = function ($event) {
                    if ($scope.message.indexOf('@') === $scope.message.length - 1) {
                        // open menu
                    }
                };
                /**
                 * Check if sidenav is open
                 *
                 * @returns {*}
                 */
                $scope.isOpenRight = function () {
                    return $mdSidenav('right').isOpen();
                };
                /**
                 * Toggle chat sidenav
                 */
                $scope.toggleRight = function (e) {
                    $mdSidenav('right').toggle();
                };
                /**
                 * Change active chatroom.
                 */
                $scope.changeRoom = function (chatroom) {
                    changeRoom(chatroom);
                };
                /**
                 *
                 * @param chatroom
                 */
                $scope.leaveRoom = function (chatroom) {
                    WebSocketsService.unsubscribe(chatroom.channel);
                    ChatService.removeChatroom(chatroom);
                    FavoritesService.removeFavorite(chatroom);

                    if ($scope.chatrooms.length === 0) {
                        $state.go('app.chat');
                    } else {
                        changeRoom($scope.chatrooms[0]);
                    }
                };
                /**
                 *
                 * @param username
                 * @param closeSideBar
                 */
                $scope.appendUsernameToChatEntry = function (username, closeSideBar) {
                    if ($scope.message.length > 0)
                        $scope.message += ' @' + username + ' ';
                    else
                        $scope.message += '@' + username + ' ';

                    if (closeSideBar)
                        $mdSidenav('right').close();

                    angular.element('#chat-message-input').trigger('focus');
                };
                /**
                 *
                 */
                $scope.openEmojisBottomSheet = function () {
                    var bottomSheet = $mdBottomSheet.show({
                        templateUrl: './views/bottom-sheets/emojis/emojis.html',
                        parent: $('.Page-Container.Chat-App > md-content:first-child'),
                        controller: 'EmojisBottomSheetController'
                    });

                    bottomSheet.then(function (e) {
                        if ($scope.message.length > 0)
                            $scope.message += ' ' + e.emojis + ' ';
                        else
                            $scope.message += '' + e.emojis + ' ';

                        if (e.sendMessage) {
                            $scope.sendMessage($scope.chatroom);
                        } else {
                            angular.element('#chat-message-input').trigger('focus');
                        }
                    });
                };
                /**
                 *
                 * @param $files
                 */
                $scope.onFileSelect = function ($files) {
                    if ($files && $files.length > 0)
                        DialogService.confirm('Are you sure you want to post this picture?').then(function () {
                            ToastService.show('Uploading photo...');
                            Upload.upload({
                                url: '/api/messages/photo',
                                method: 'POST',
                                headers: {Authorization: 'Bearer ' + Session.getToken()},
                                file: $files[0],
                                data: {channel: $scope.chatroom.channel}
                            }).success(function (response) {
                                $scope.chatroom.pushMessage(response.data);
                                $scope.$broadcast(EVENTS.chat.messageSent, $scope.chatroom, response.data, 'list');
                            }).error(function (response, status) {
                                if (status === 403) {
                                    ToastService.error('You can only post 5 images per minute. Please wait 1 minute to post more.');
                                } else {
                                    ToastService.error('Sorry, something went wrong.');
                                }
                            });
                        });
                };

                /**
                 * Initialize controller
                 */
                function initializeController() {
                    var title = $stateParams.title;

                    if (title) {
                        joinCorrectRoom(title);
                    } else {
                        if ($scope.chatrooms.length > 0) {
                            changeRoom($scope.chatrooms[0]);
                        } else {
                            $state.go('app.chat');
                        }
                    }
                }

                /**
                 * Change active chatroom and url.
                 *
                 * @param chatroom
                 */
                function changeRoom(chatroom) {
                    $scope.chatroom = chatroom;
                    chatroom.setAsActiveChatroom();
                }

                /**
                 * Figure out what type of chatroom it is and join it
                 *
                 * @param title
                 */
                function joinCorrectRoom(title) {
                    var isPrivate = title.indexOf('@') === 0;
                    var isProtected = title.indexOf('_') === 0;
                    var isPublic = !isPrivate && !isProtected;

                    if (isPublic) {
                        joinPublicChat(title);
                    } else if (isPrivate) {
                        joinPrivateChat(title);
                    } else if (isProtected) {
                        joinProtectedChat(title);
                    }
                }

                /**
                 *
                 * @param title
                 */
                function joinPublicChat(title) {
                    var chatroom = ChatService.findChatroom({channel: 'pub_' + title.toLowerCase()});

                    if (chatroom) {
                        changeRoom(chatroom);
                    } else {
                        chatroom = ChatService.createChatroom({
                            type: 'public',
                            title: title
                        });
                        changeRoom(chatroom);
                    }
                }

                /**
                 *
                 * @param title
                 */
                function joinPrivateChat(title) {
                    var chatroom = ChatService.findChatroom({title: title});
                    if (chatroom) {
                        changeRoom(chatroom);
                    } else {
                        Restangular.all('users').get(title.replace('@', ''), {forChat: true}).then(function (response) {
                            if (!response.data) {
                                ToastService.error('Couldn\'t find user.');

                                if ($scope.chatrooms.length > 0) {
                                    changeRoom($scope.chatrooms[0]);
                                } else {
                                    $state.go('app.chat');
                                }
                            } else {
                                chatroom = ChatService.createChatroom({
                                    type: 'private',
                                    title: response.data.username,
                                    user: response.data
                                });
                                changeRoom(chatroom);
                            }
                        });
                    }
                }

                /**
                 *
                 * @param title
                 */
                function joinProtectedChat(title) {
                    var chatroom = ChatService.findChatroom({channel: 'pro' + title});

                    if (chatroom) {
                        changeRoom(chatroom);
                    } else {
                        Restangular.all('chatrooms').get('pro' + title).then(function (response) {
                            if (response.data) {
                                chatroom = new ChatService.createChatroom({
                                    type: 'protected',
                                    title: response.data.title,
                                    channel: response.data.channel
                                });
                                changeRoom(chatroom);
                            } else {
                                ToastService.show('Something went wrong!');
                                $state.go('app.chat');
                            }
                        });
                    }
                }
            }
        );

})();
