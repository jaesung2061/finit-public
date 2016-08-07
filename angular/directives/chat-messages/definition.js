(function () {
    "use strict";

    angular.module('app.directives')
        .directive('chatMessages', function ($stateParams, ChatService, $compile, $filter, EVENTS) {

            function generateMessageMarkup(message, chatroom) {
                var followUpMessagesLength,
                    followUpMessagesMarkup,
                    nameClass = '',
                    markup,
                    date,
                    i;

                if (message.sender.mod_powers && message.sender.mod_powers.indexOf(chatroom.channel) > -1) {
                    nameClass = 'is-mod';
                } else if (message.sender.id === 1) {
                    nameClass = 'is-admin';
                }

                if (message.photo) {
                    date = message.created_at.split(/[- :]/);
                    date = new Date(Date.UTC(date[0], date[1] - 1, date[2], date[3], date[4], date[5]));

                    if (date != 'Invalid Date') {
                        message.created_at = $filter('date')(date, 'shortTime');
                    }

                    markup =
                        '<md-list-item class="chat-message md-2-line">' +
                        '<img class="md-avatar" src="' + message.sender.picture_xs + '" ng-click="$state.go(\'app.chat.show\', {title: \'@' + message.sender.username + '\'})">' +
                        '<div class="md-list-item-text">' +
                        '<h3>' +
                        '<span class="' + nameClass + '" ng-click="appendUsernameToChatEntry(\'' + message.sender.username + '\')">' + message.sender.username + '</span>' +
                        '<small>' + message.created_at + '</small>' +
                        '</h3>' +
                        '<p>' +
                        '<a href="' + message.photo.url + '" data-lightbox="' + message.sender.username + '" title="Posted by ' + message.sender.username + '">Image</a> - ' +
                        '<a href="' + message.photo.url + '" target="_blank">Direct Link</a>' +
                        '</p>' +
                        '</div>' +
                        '</md-list-item>';
                } else if (message.me) {
                    markup =
                        '<md-list-item class="chat-message md-1-line me">' +
                        '<img class="md-avatar" src="' + message.sender.picture_xs + '" ng-click="$state.go(\'app.chat.show\', {title: \'@' + message.sender.username + '\'})">' +
                        '<div class="md-list-item-text">' +
                        '<p><i>' + message.body + '</i></p>' +
                        '</div>' +
                        '</md-list-item>';
                } else if (message.spoiler) {
                    markup =
                        '<md-list-item class="chat-message md-2-line spoiler">' +
                        '<img class="md-avatar" src="' + message.sender.picture_xs + '" ng-click="$state.go(\'app.chat.show\', {title: \'@' + message.sender.username + '\'})">' +
                        '<div class="md-list-item-text">' +
                        '<h3>' +
                        '<span class="' + nameClass + '" ng-click="appendUsernameToChatEntry(\'' + message.sender.username + '\')">' + message.sender.username + '</span>' +
                        '<small>' + message.created_at + '</small>' +
                        '</h3>' +
                        '<p>' + message.body + '</p>' +
                        '</div>' +
                        '</md-list-item>';
                } else {
                    followUpMessagesMarkup = appendFollowUpMessages();

                    markup =
                        '<md-list-item class="chat-message md-2-line">' +
                        '<img class="md-avatar" src="' + message.sender.picture_xs + '" ng-click="$state.go(\'app.chat.show\', {title: \'@' + message.sender.username + '\'})">' +
                        '<div class="md-list-item-text">' +
                        '<h3>' +
                        '<span class="' + nameClass + '" ng-click="appendUsernameToChatEntry(\'' + message.sender.username + '\')">' + message.sender.username + '</span>' +
                        '<small>' + message.created_at + '</small>' +
                        '</h3>' +
                        (message.memeArrow ? '<p class="meme-arrow">' : '<p>') + message.body + '</p>' +
                        followUpMessagesMarkup +
                        '</div>' +
                        '</md-list-item>';
                }

                function appendFollowUpMessages() {
                    followUpMessagesMarkup = '';
                    if (message.followUpMessages && message.followUpMessages.length > 0) {
                        followUpMessagesLength = message.followUpMessages.length;
                        for (i = 0; i < followUpMessagesLength; i++) {
                            followUpMessagesMarkup += (message.memeArrow ? '<p class="follow-up-message meme-arrow">' : '<p class="follow-up-message">') + message.followUpMessages[i].body + '</p>';
                        }
                    }
                    return followUpMessagesMarkup;
                }

                return markup;
            }

            function generateInChatNotificationMarkup(event, data) {
                switch (event) {
                    case 'new-poll':
                        return '<md-list-item class="chat-event"><p>New poll has been posted. <span>' + $filter('date')(new Date(), 'shortTime') + '</span></p></md-list-item>';
                }
            }

            /**
             * If the current state is not for the given chatroom,
             * don't overwrite the messages for the active chatroom
             *
             * @param chatroom
             * @param force
             * @returns {boolean}
             */
            function allowAppend(chatroom, force) {
                var allowAppend = true;

                if (chatroom.channel.indexOf('pro_') === 0) {
                    allowAppend = $stateParams.title === chatroom.channel.substr(3);
                } else if (!force && $stateParams.title.toLowerCase() !== chatroom.title.toLowerCase().replace('#', '')) {
                    allowAppend = false;
                }

                return allowAppend;
            }

            return {
                restrict: 'EA',
                controller: 'ChatMessagesController',
                link: function ($scope, $element, $attrs) {
                    $scope.$on(EVENTS.chat.messagesReceived, function (event, chatroom, force) {
                        if (!allowAppend(chatroom, force)) {
                            return
                        }
                        $element.empty();

                        var length = chatroom.messages.length,
                            concatenatedHtml = '',
                            i, compiledHtml;

                        for (i = 0; i < length; i++) {
                            concatenatedHtml += generateMessageMarkup(chatroom.messages[i], chatroom);
                        }

                        compiledHtml = $compile(concatenatedHtml)($scope);

                        $element.append(compiledHtml);
                    });
                    $scope.$on(EVENTS.chat.messageSent, function (event, chatroom, message, appendTo) {
                        appendMessage(chatroom, appendTo, message);
                    });
                    $scope.$on(EVENTS.chat.messageReceived, function (event, chatroom, message, appendTo) {
                        appendMessage(chatroom, appendTo, message);
                    });
                    $scope.$on(EVENTS.chat.notificationEvent, function (event, chatEvent, chatroom, message) {
                        if (ChatService.getActiveChatroom().channel === chatroom.channel) {
                            $element.append(generateInChatNotificationMarkup(chatEvent, message));
                        }
                    });

                    function appendMessage(chatroom, appendTo, message) {
                        if (!allowAppend(chatroom)) {
                            return
                        }

                        if (appendTo === 'list') {
                            $element.append($compile(generateMessageMarkup(message, chatroom))($scope));
                        } else if (appendTo === 'lastMessage') {
                            $element.find('md-list-item:last-child .md-list-item-text').append((message.memeArrow ? '<p class="meme-arrow">' : '<p>') + message.body + '</p>')
                        }

                        if ($element.children().length > 100) {
                            $element.children('md-list-item:first-child').remove();
                        }
                    }
                }
            };
        });

})();
