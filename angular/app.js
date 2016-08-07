(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('ApplicationController', function ($rootScope
            , NotificationsService
            , WebSocketsService
            , FavoritesService
            , FriendsService
            , CookiesService
            , $localStorage
            , DialogService
            , $stateParams
            , ToastService
            , UsersService
            , Restangular
            , AuthService
            , ChatService
            , $mdSidenav
            , $mdMedia
            , $timeout
            , Session
            , $state
            , EVENTS
            , $log) {
            $rootScope.$state = $state;
            $rootScope.$log = $log;
            $rootScope.$mdMedia = $mdMedia;
            $rootScope.currentUser = null;
            $rootScope.logout = AuthService.logout;
            $rootScope.tabFocused = true;
            $rootScope.darkThemeEnabled = CookiesService.get('darkThemeEnabled');

            $rootScope.$on(EVENTS.auth.loginSuccess, authTasks);
            $rootScope.$on(EVENTS.auth.logoutSuccess, deAuthTasks);
            $rootScope.$on(EVENTS.auth.loginFailed, deAuthTasks);
            var off = $rootScope.$on('$stateChangeSuccess', function () {
                // Try to login user if token present
                if (CookiesService.get('auth_token')) {
                    Session.authRequestSent = true;
                    AuthService.authenticate(CookiesService.get('auth_token'));
                } else {
                    if ($state.is('app.chat.show') && $stateParams.title) {
                        DialogService.fromTemplate('accounts', null, {
                            clickOutsideToClose: false,
                            locals: {channel: $stateParams.channel}
                        });
                    } else {
                        Session.authRequestSent = true;
                        $rootScope.$broadcast(EVENTS.auth.loginFailed);
                        if ($state.current.data.authorization === 'auth') {
                            $state.go('app.home');
                        }
                    }
                }

                off();
            });

            /**
             * Get partial.
             *
             * @param parentViewName
             * @param partialName
             * @returns {string}
             */
            $rootScope.getPartial = function (parentViewName, partialName) {
                return './views/app/' + parentViewName + '/partials/' + partialName + '.html?' + Finit.version;
            };
            /**
             * Open menu for friend
             *
             * @param $mdOpenMenu
             * @param ev
             */
            $rootScope.openMenu = function ($mdOpenMenu, ev) {
                ev.preventDefault();
                $mdOpenMenu(ev);
            };
            /**
             * Join chat
             *
             * @param chatroom
             */
            $rootScope.joinChat = function (chatroom) {
                if (chatroom.type && chatroom.type === 'protected') {
                    $state.go('app.chat.show', {title: chatroom.channel.substr(3)});
                } else if ($state.is('app.chat.show')) {
                    $rootScope.$broadcast('change-chatrooms', chatroom);
                } else {
                    $state.go('app.chat.show', {title: chatroom.title.replaceAll({'#': ''})});
                }
            };
            /**
             * Open dialog
             *
             * @param template
             * @param options
             */
            $rootScope.openDialog = function (template, options) {
                if (template === 'create-account' && $rootScope.currentUser && !$rootScope.currentUser.is_temp)
                    return;

                options = options || {};

                DialogService.fromTemplate(template, null, options);
            };
            /**
             * Toggle dark theme
             */
            $rootScope.toggleDarkTheme = function () {
                CookiesService.remove('darkThemeEnabled');
                $rootScope.darkThemeEnabled = !$rootScope.darkThemeEnabled;
                if ($rootScope.darkThemeEnabled)
                    CookiesService.create('darkThemeEnabled', true);
            };
            /**
             * Check if user is a mod for a given channel
             *
             * @param user
             * @param channel
             * @returns {boolean}
             */
            $rootScope.isModFor = function (user, channel) {
                return user && (user.mod_powers.indexOf(channel) > -1 || user.id === 1);
            };
            /**
             * Check if user is the owner for a given channel
             *
             * @param user
             * @param chatroom
             * @returns {boolean}
             */
            $rootScope.isOwner = function (user, chatroom) {
                return chatroom.owner_id === user.id || currentUser.id === 1;
            };

            function authTasks(e, data) {
                $rootScope.currentUser = data.user;

                Session.create(data.token, data.user);
                Session.authRequestComplete = true;

                if (data.remember || CookiesService.get('remember')) {
                    CookiesService.create('auth_token', data.token, 14);
                    CookiesService.create('remember', true, 14);
                } else {
                    CookiesService.create('auth_token', data.token);
                }

                Restangular.setDefaultHeaders({Authorization: 'Bearer ' + data.token});

                if (!$rootScope.currentUser.is_temp) {
                    NotificationsService.getNotifications();
                    FriendsService.getCurrentUsersFriends();
                    FriendsService.getFriendRequests();
                    FavoritesService.getFavorites().then(function () {
                        for (var i = 0; i < FavoritesService.favorites.length; i++) {
                            var chatroom = FavoritesService.favorites[i];
                            if (!($state.is('app.chat.show') && $stateParams.title.toLowerCase() === chatroom.title.toLowerCase()) && !ChatService.findChatroom({channel: chatroom.channel})) {

                                if (chatroom.channel.indexOf('pub_') === 0) {
                                    chatroom.type = 'public';
                                } else if (chatroom.channel.indexOf('pro_') === 0) {
                                    chatroom.type = 'protected';
                                } else if (chatroom.channel.indexOf('prv_') === 0) {
                                    chatroom.type = 'private';
                                }

                                chatroom = ChatService.createChatroom(chatroom);
                            }
                        }
                    });
                }

                if ($state.current.data.authorization === 'guests') {
                    $state.go('app.home');
                }
            }

            function deAuthTasks(e, data) {
                Session.authRequestComplete = true;
                $rootScope.currentUser = null;
                $rootScope.toggled = false;

                Session.destroy();
                Restangular.setDefaultHeaders(null);
                CookiesService.remove('auth_token');
                CookiesService.remove('remember');

                NotificationsService.clearData();
                FriendsService.clearData();
                FavoritesService.clearData();
                ChatService.clearData();
                WebSocketsService.reset();
                delete $localStorage.savedChatrooms;
            }
        });

})();
