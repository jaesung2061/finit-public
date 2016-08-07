(function () {
    "use strict";

    angular.module('app.services')
        .factory('CommandsService', function ($rootScope, Restangular, ToastService, ChatService, DialogService) {
            var isCommandRegex = (function () {
                var messageTransformCommands = [
                    'spoiler',
                    'me',
                    'r\/',
                    'u\/',
                    'face',
                    'f' // Alias of /face
                ];
                var pattern = '^\/(?!' + messageTransformCommands.join('|') + ')[a-z0-9]+';

                return new RegExp(pattern, 'i')
            })();
            var selfCommands = {
                help: {},
                google: {},
                wa: {}
            };
            var service = this;

            /**
             * Test if it is a command
             *
             * @param message
             * @returns {boolean}
             */
            service.test = function (message) {
                return isCommandRegex.test(message);
            };
            /**
             * Execute command
             *
             * @param message
             * @param chatroom
             */
            service.execute = function (message, chatroom) {
                var command = service.parseCommand(message);

                switch (command.command) {
                    case 'join':
                        return joinChat(command);
                    case 'leave':
                        return leaveChat(command);
                    case 'help':
                        return showHelp(command);
                    case 'google':
                        return searchGoogle(command);
                    case 'wa':
                        return searchWolframAlpha(command);
                    default:
                        return Restangular.all('commands/execute').post({
                            command: command.command,
                            args: command.args,
                            channel: chatroom.channel
                        }).then(function (response) {
                            ToastService.show(response);
                            refreshMutes(command);
                        }, function (response) {
                            ToastService.error(response.data);
                            refreshMutes(command);
                        });
                }
            };
            /**
             *
             * @param message
             */
            service.parseCommand = function (message) {
                var command = message.match(/^(?:\/)[a-z0-9]+(?:\s)?/gi)[0].trim().replace('/', '');
                var args = message.match(/\s.*$/);

                if (args) {
                    args = args.map(function (arg) {
                        return arg.trim();
                    });
                }

                return {
                    command: command,
                    args: args
                };
            };

            /**
             *
             * @param command
             */
            function joinChat(command) {
                $rootScope.$broadcast('change-chatrooms', {channel: 'pub_' + command.args[0].trim().replace('#', '')});
            }

            /**
             *
             * @param command
             */
            function leaveChat(command) {
                if (!command.args) {
                    $rootScope.$broadcast('leave-chatroom');
                } else {
                    var chatroom = ChatService.findChatroom({title: command.args[0].trim().replace('#', '')});
                    $rootScope.$broadcast('leave-chatroom', chatroom);
                }
            }

            /**
             *
             */
            function showHelp() {
                DialogService.fromTemplate('help');
            }

            /**
             *
             * @param command
             */
            function searchGoogle(command) {
                ToastService.show('Not ready...');
            }

            /**
             *
             * @param command
             */
            function searchWolframAlpha(command) {
                ToastService.show('Not ready...');
            }

            /**
             * Refresh mutes
             *
             * @param command
             */
            function refreshMutes(command) {
                if (command.command === 'mute' || command.command === 'unmute') {
                    Restangular.all('mutes').getList().then(function (response) {
                        $rootScope.currentUser.mutedUsers = response;
                    });
                }
            }

            return service;
        });

})();
