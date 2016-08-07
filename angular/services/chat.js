(function () {
    "use strict";

    angular.module('app.services')
        .factory('ChatService', function (WebSocketsService
                , $localStorage
                , PollsService
                , ToastService
                , $stateParams
                , Restangular
                , $rootScope
                , $timeout
                , $window
                , $filter
                , Helpers
                , $state
                , EVENTS
                , FACES
                , $q) {
                var service = this;
                var chatrooms = []; // SINGLETON OBJECT, DO NOT DELETE, ONLY EMPTY
                var Messages = Restangular.all('messages');
                var Chatrooms = Restangular.all('chatrooms');
                var activeChatroom = null;
                var messagesSinceTabBlur = 0;
                var pingSound = new Audio('/sounds/pinged2.mp3');
                var guestSender = {
                    id: 0,
                    username: 'Guest',
                    picture_xs: '/images/avatar-male.jpg',
                    mod_powers: []
                };

                // This will be used for the sidebar
                // When new messages arrive but user is not focused on chat
                service.unread_messages = {total: 0};

                $rootScope.$on('tab-focused', function () {
                    $timeout(function () {
                        messagesSinceTabBlur = 0;
                        if ($state.is('app.chat.show')) {
                            setMetaDataFor(activeChatroom);
                        } else {
                            Helpers.updateMetadata('Finit - Hashtag Chatting');
                        }
                    }, 100);
                });
                $rootScope.$on(WebSocketsService.disconnectionEvent, function () {
                    WebSocketsService.clearListeners();
                    for (var i = 0; i < chatrooms.length; i++) {
                        chatrooms[i].readyState = 0;
                    }
                    var off = $rootScope.$on(WebSocketsService.connectionSuccessEvent, function () {
                        for (var i = 0; i < chatrooms.length; i++) {
                            chatrooms[i].subscribe();
                        }
                        off();
                    });
                });
                $rootScope.$on('chatroom-state-change', function (e, data) {
                    var chatroom = findChatroom({channel: data.channel});
                    chatroom.settings = data.data.settings;
                });
                $rootScope.$on('user-state-change', function (e, data) {
                    var chatroom = findChatroom({channel: data.channel});
                    var user = chatroom.findMember(data.data.id);

                    for (var key in data.data) {
                        user[key] = data.data[key];
                    }
                });

                /**
                 * Create chatroom
                 *
                 * @param attributes
                 * @returns {null}
                 */
                service.createChatroom = function (attributes) {
                    var chatroom = findChatroom(attributes);

                    if (chatroom) {
                        chatroom.subscribe();

                        return chatroom;
                    }

                    chatroom = new service.Chatroom(attributes);
                    chatroom.subscribe();
                    service.registerChatroom(chatroom);

                    if (Finit.chatroom && Finit.chatroom.channel === chatroom.channel) {
                        chatroom.description = Finit.chatroom.description;
                        chatroom.description_short = Finit.chatroom.description_short;
                        chatroom.tab_title = Finit.chatroom.tab_title;
                    }

                    return chatroom;
                };
                /**
                 * Chatroom constructor
                 *
                 * @param attributes
                 * @returns service.Chatroom
                 * @constructor
                 */
                service.Chatroom = function Chatroom(attributes) {
                    var chatroom;

                    if (!attributes.type) throw new Error('Must have chatroom type.');

                    if (chatroom = _.find(chatrooms, attributes)) {
                        return chatroom;
                    }

                    var that = this;
                    this.readyState = 0;
                    this.type = attributes.type;
                    this.member_count = 0;
                    this.unread_messages_count = 0;
                    this.messages = [];
                    this.description = '';

                    switch (attributes.type) {
                        case 'public':
                            this.title = '#' + attributes.title.replaceAll({'#': ''});
                            this.suffix = attributes.title.replaceAll({'#': ''}).toLowerCase();
                            this.channel = 'pub_' + this.suffix;
                            break;
                        case 'private':
                            this.title = '@' + attributes.user.username;
                            this.suffix = generatePrivateChatroomSuffix($rootScope.currentUser, attributes.user);
                            this.channel = 'prv_' + this.suffix;
                            this.otherUser = attributes.user;
                            break;
                        case 'protected':
                            this.title = attributes.title;
                            this.suffix = attributes.channel.substr(4);
                            this.channel = attributes.channel;
                            break;
                    }

                    this.subscribe = function () {
                        // Subscribe when connection ready
                        if (WebSocketsService.connected) {
                            subscribe(this).then(function (chatroom) {
                                chatroom.getMessages().getPolls().getInfo();
                            });
                        } else {
                            var off = $rootScope.$on(WebSocketsService.connectionSuccessEvent, function (e, data) {
                                off();
                                subscribe(that).then(function (chatroom) {
                                    chatroom.getMessages().getPolls().getInfo();
                                });
                            });
                        }
                    };
                    this.getMessages = function () {
                        _.remove(this.messages);
                        Messages.getList({chatroom_channel: this.channel}).then(function (response) {
                            var messages = response,
                                length = messages.length,
                                i, date;

                            messages = $filter('orderBy')(messages, 'created_at');

                            for (i = 0; i < length; i++) {
                                date = messages[i].created_at.split(/[- :]/);
                                date = new Date(Date.UTC(date[0], date[1] - 1, date[2], date[3], date[4], date[5]));
                                messages[i].created_at = $filter('date')(date, 'shortTime');
                                messages[i].timestamp = date.getTime();
                                that.pushMessage(messages[i], null, i);
                            }

                            $rootScope.$broadcast(EVENTS.chat.messagesReceived, that);

                            that.readyState = 2;
                        });

                        return this;
                    };
                    this.getInfo = function () {
                        if (this.type === 'public' || this.type === 'protected') {
                            Chatrooms.get(this.channel).then(function (response) {
                                if (response.data) {
                                    that.description = response.data.description;
                                    that.description_short = response.data.description_short;
                                    that.owner_id = response.data.owner_id;
                                    that.tab_title = response.data.tab_title;

                                    if (response.data.settings) {
                                        that.settings = JSON.parse(response.data.settings);
                                    }
                                }

                                if (that.isActive()) {
                                    setMetaDataFor(that);
                                }
                            });
                        }

                        return this;
                    };
                    this.setAsActiveChatroom = function () {
                        activeChatroom = this;
                        activeChatroom.unread_messages_count = 0;
                        service.updateUnreadMessagesTotal();
                        activeChatroom.resetUnreadMessages();
                        setMetaDataFor(this);
                        var promise = updateUrl(this);

                        if (promise) {
                            promise.then(function () {
                                $rootScope.$broadcast(EVENTS.chat.messagesReceived, that);
                            });
                        } else {
                            $timeout(function () {
                                $rootScope.$broadcast(EVENTS.chat.messagesReceived, that, true);
                            }, 250);
                        }

                        return this;
                    };
                    this.pushMessage = function (message, setDate) {
                        if (!message.sender) {
                            message.sender = guestSender;
                        }

                        var latestMessage = this.messages[this.messages.length > 0 ? this.messages.length - 1 : 0];
                        var appendTo = '';
                        message.body = service.parseMessage(message);

                        if (setDate && !message.created_at) {
                            var date = new Date();
                            message.created_at = $filter('date')(date, 'shortTime');
                            message.timestamp = date.getTime();
                        }

                        if (this.messages.length === 0 || latestMessage.me || message.me || latestMessage.spoiler || message.spoiler || message.photo) {
                            this.messages.push(message);
                            appendTo = 'list';
                        } else {
                            var prevMessageLessThanThirtySecAgo = message.timestamp - latestMessage.timestamp < 30000;
                            var isFromSameSender = latestMessage.sender && message.sender && latestMessage.sender.id === message.sender.id;
                            var areNotMeMessages = (latestMessage && message) && !latestMessage.me && !message.me;

                            if (isFromSameSender && areNotMeMessages && prevMessageLessThanThirtySecAgo) {
                                if (!latestMessage.followUpMessages) {
                                    latestMessage.followUpMessages = [message];
                                } else {
                                    latestMessage.followUpMessages.push(message);
                                }
                                appendTo = 'lastMessage';
                            } else {
                                this.messages.push(message);
                                appendTo = 'list';
                            }
                        }
                        return appendTo;
                    };
                    this.getPolls = function () {
                        PollsService.getPoll(this).then(function (response) {
                            if (response[0]) {
                                that.poll = PollsService.calculatePercentages(response[0]);
                                that.pollMeta = response.meta;
                            }
                        });
                        return this;
                    };
                    this.resetUnreadMessages = function () {
                        this.unread_messages_count = 0;
                        service.updateUnreadMessagesTotal();
                    };
                    this.isActive = function () {
                        return activeChatroom && activeChatroom.title === this.title && $state.is('app.chat.show');
                    };
                    this.incrementUnreadMessagesCount = function () {
                        this.unread_messages_count++;
                        service.updateUnreadMessagesTotal();
                    };
                    this.notify = function (event, data) {
                        $rootScope.$broadcast(EVENTS.chat.notificationEvent, event, this, data);
                    };
                    this.findMember = function (id) {
                        return _.find(this.members, {id: id});
                    };

                    return this;
                };
                /**
                 * Add chatroom to array
                 *
                 * @param chatroom
                 */
                service.registerChatroom = function (chatroom) {
                    if (!_.find(chatrooms, {type: chatroom.type, suffix: chatroom.suffix})) {
                        chatrooms.push(chatroom);
                    }
                    chatrooms.sort(function (a, b) {
                        if (a.title < b.title)
                            return -1;

                        if (a.title > b.title)
                            return 1;

                        return 0;
                    });
                };
                /**
                 *
                 * @returns {Array}
                 */
                service.getChatrooms = function () {
                    return chatrooms;
                };
                /**
                 * Find chatroom in service
                 *
                 * @param chatroom
                 * @returns Chatroom | null
                 */
                service.findChatroom = function (chatroom) {
                    return findChatroom(chatroom);
                };
                /**
                 * Set active chatroom
                 *
                 * @param chatroom
                 */
                service.setActiveChatroom = function (chatroom) {
                    activeChatroom = chatroom;
                    activeChatroom.unread_messages_count = 0;
                    service.updateUnreadMessagesTotal();
                };
                /**
                 * Get active chatroom
                 *
                 * @returns {*}
                 */
                service.getActiveChatroom = function () {
                    return activeChatroom;
                };
                /**
                 * Get active chatroom
                 *
                 * @returns {*}
                 */
                service.getActiveChatroom = function () {
                    return activeChatroom;
                };
                /**
                 *
                 * @param chatroom
                 */
                service.removeChatroom = function (chatroom) {
                    _.remove(chatrooms, {channel: chatroom.channel});
                };
                /**
                 * Update total unread messages.
                 */
                service.updateUnreadMessagesTotal = function () {
                    var total = 0;

                    for (var i = 0; i < chatrooms.length; i++) {
                        if (chatrooms[i].type === 'private')
                            total += chatrooms[i].unread_messages_count;
                    }

                    service.unread_messages.total = total;
                };
                /**
                 * If the websocket connection fails during a successful connection. Wait
                 * for another connectionSuccessEvent, then resubscribe to all channels
                 *
                 * @param subscribeCallback
                 */
                service.listenForWSDisconnection = function (subscribeCallback) {
                    $rootScope.$on(WebSocketsService.disconnectionEvent, function () {
                        WebSocketsService.clearListeners();

                        for (var i = 0; i < chatrooms.length; i++) {
                            chatrooms[i].readyState = 0;
                            chatrooms[i].isSubscribed = false;
                        }

                        var off2 = $rootScope.$on(WebSocketsService.connectionSuccessEvent, function () {
                            off2();
                            for (var i = 0; i < chatrooms.length; i++) {
                                subscribeCallback(chatrooms[i]);
                            }
                        });
                    });
                };
                /**
                 * Clear service data
                 */
                service.clearData = function () {
                    // Empty array, but keept the array itself
                    _.remove(chatrooms);
                    activeChatroom = null;
                };
                /**
                 *
                 * @param message
                 * @returns {String|*}
                 */
                service.parseMessage = (function () {
                    var meRegex = /^\/me .*$/;
                    var spoilerRegex = /^\/(spoiler) .*$/;
                    var faceRegex = /^\/(face) .*$/;
                    var faceRegexShort = /^\/f .*$/;
                    var quoteRegex = /^>/;

                    return function (message) {
                        var parsed;
                        var linkifyOptions = {
                            callback: function (text, href) {
                                if (/\.(jpg|jpeg|png|bmp|gif)$/i.test(href)) {
                                    if (href) {
                                        return '<a href="' + href + '" data-lightbox="' + message.sender.username + '" title="Posted by ' + message.sender.username + '">' + text + '<\/a>' +
                                            ' - ' +
                                            '<a href="' + href + '" title="' + href + '" target="_blank">Direct link</a>';
                                    } else {
                                        return text;
                                    }
                                }

                                return href ? '<a href="' + href + '" target="_blank" title="' + href + '">' + text + '<\/a>' : text;
                            }
                        };

                        if (meRegex.test(message.body)) {
                            message.me = true;
                            parsed = message.sender.username + ' ' + message.body.substr(4, message.body.length);
                        } else if (spoilerRegex.test(message.body)) {
                            message.spoiler = true;
                            parsed = message.body.substr(9, message.body.length);
                        } else if (faceRegex.test(message.body)) {
                            message.face = true;
                            parsed = message.body.substr(6, message.body.length).replaceAll(FACES);
                        } else if (faceRegexShort.test(message.body)) {
                            // Alias of /face
                            message.face = true;
                            parsed = message.body.substr(3, message.body.length).replaceAll(FACES);
                        } else if (quoteRegex.test(message.body)) {
                            message.memeArrow = true;
                            parsed = message.body.trim();
                        } else {
                            parsed = message.body.trim();
                        }

                        // The order is important here, don't fuck with it
                        parsed = escapeHtml(parsed);
                        parsed = linkify(parsed, linkifyOptions);
                        parsed = parseHashtags(parsed);
                        parsed = parseEmoji(parsed);
                        parsed = parseReddits(parsed);
                        parsed = parseMarkdown(parsed);
                        parsed = parsed.replaceAll({'(^|\\s)hunter2(\\b|\\s)': ' ******* '});

                        return parsed;
                    }
                })();

                /**
                 * Find chatroom in service.
                 *
                 * @param params
                 */
                function findChatroom(params) {
                    return _.find(chatrooms, params);
                }

                /**
                 *
                 * @param chatroom
                 */
                function subscribe(chatroom) {
                    var deferred = $q.defer();

                    if (chatroom.readyState === 0) {
                        chatroom.readyState = 1;
                        WebSocketsService.subscribe(chatroom, function (channel) {

                            WebSocketsService.on(channel, 'subscribed', function (data) {
                                // Save as favorite on subscription
                                // On browser refresh, these chatrooms will be auto joined
                                if (!chatroom.isFavorite && (chatroom.type === 'public' || chatroom.type === 'protected')) {
                                    Restangular.all('favorites').post({
                                        channel: chatroom.channel,
                                        title: chatroom.title.replace('#', '')
                                    });
                                    chatroom.isFavorite = true;
                                }

                                var eachMemberCount = _.countBy(data.members, 'id'); // count duplicates
                                data.members = _.uniq(data.members, 'id'); // remove duplicates

                                for (var key in eachMemberCount) {
                                    for (var i = 0; i < data.members.length; i++) {
                                        if (data.members[i].id === key) {
                                            data.members[i].count = eachMemberCount[key];
                                        } else {
                                            data.members[i].count = 1;
                                        }
                                    }
                                }

                                chatroom.members = data.members;
                                chatroom.member_count = data.members.length;
                                chatroom.members.sort(compareMembers);

                                $rootScope.$broadcast(EVENTS.chat.messagesReceived, chatroom);
                                Helpers.setIsFriendAttributes(chatroom);
                                deferred.resolve(chatroom);
                            });
                            WebSocketsService.on(channel, 'subscription-failure', function (data) {
                                if (data.reason === 'banned')
                                    ToastService.error('You have been banned from this channel.');
                                if (data.reason === 'invalid-input')
                                    ToastService.error('Please use only alphanumeric characters.');
                                if (data.reason === 'forbidden')
                                    ToastService.error('Forbidden.');

                                $rootScope.$broadcast('banned-from-channel', {data: data, chatroom: chatroom});
                            });
                            WebSocketsService.on(channel, 'member-added', function (data) {
                                var member = _.find(chatroom.members, {id: data.data.id});

                                if (member) {
                                    if (!member.count || member.count === 1) {
                                        member.count = 2;
                                    } else {
                                        member.count++;
                                    }
                                } else {
                                    chatroom.members.push(data.data);
                                    chatroom.member_count++;
                                    chatroom.members.sort(compareMembers);
                                    Helpers.setIsFriendAttributes(chatroom);
                                }
                            });
                            WebSocketsService.on(channel, 'member-removed', function (data) {
                                var member = _.find(chatroom.members, {id: data.data.id});

                                if (member.count > 1) {
                                    member.count--;
                                } else if ($rootScope.currentUser.id !== data.data.id && _.remove(chatroom.members, {id: data.data.id}).length > 0) {
                                    chatroom.member_count--;
                                }
                            });
                            WebSocketsService.on(channel, 'client-message', function (data) {
                                if ($rootScope.currentUser.mutedUsers && $rootScope.currentUser.mutedUsers.indexOf(data.data.sender.id) > -1) {
                                    return;
                                }

                                var message = data.data;

                                pingUser(chatroom, message);

                                var appendTo = chatroom.pushMessage(message, true);

                                $rootScope.$broadcast(EVENTS.chat.messageReceived, chatroom, message, appendTo);

                                if (chatroom.messages.length > 100) {
                                    chatroom.messages.splice(0, 1);
                                }

                                notifyUserIfChatNotActive(chatroom);
                            });
                            WebSocketsService.on(channel, 'client-message-starred', function (data) {
                                var star = data.data;

                                for (var i = 0; i < chatroom.messages.length; i++) {
                                    if (chatroom.messages[i].id === star.message.id) {
                                        chatroom.messages[i].starsCount++;

                                        if (star.user_id === $rootScope.currentUser.id) { // Current user is the one who liked it
                                            chatroom.messages[i].isLikedByCurrentUser = true;
                                        }

                                        break;
                                    }
                                }
                            });
                            WebSocketsService.on(channel, 'client-message-unstarred', function (data) {
                                var star = data.data;

                                for (var i = 0; i < chatroom.messages.length; i++) {
                                    if (chatroom.messages[i].id === star.message.id) {
                                        chatroom.messages[i].starsCount--;

                                        if (star.user_id === $rootScope.currentUser.id) { // Current user is the one who liked it
                                            chatroom.messages[i].isLikedByCurrentUser = false;
                                        }

                                        break;
                                    }
                                }
                            });
                            WebSocketsService.on(channel, 'client-poll-posted', function (data) {
                                if (!chatroom.poll) {
                                    chatroom.poll = PollsService.calculatePercentages(data.data);
                                } else {
                                    if (!chatroom.newPolls) {
                                        chatroom.newPolls = [];
                                    }

                                    chatroom.newPolls.push(data.data);
                                }

                                chatroom.notify('new-poll', data.data);
                            });
                            WebSocketsService.on(channel, 'client-vote', function (data) {
                                if (data.data.poll_id === chatroom.poll.id) {
                                    chatroom.poll.votes[data.data.option] += 1;
                                    chatroom.poll = PollsService.calculatePercentages(chatroom.poll);
                                }
                            });
                            WebSocketsService.on(channel, 'banned-from-channel', function (data) {
                                ToastService.error('You have been banned from ' + chatroom.title + '.');
                                $rootScope.$broadcast('banned-from-channel', {data: data, chatroom: chatroom});
                            });
                            WebSocketsService.on(channel, 'kicked-from-channel', function (data) {
                                ToastService.error('You have been kicked from ' + chatroom.title + '.');
                                $rootScope.$broadcast('banned-from-channel', {data: data, chatroom: chatroom});
                            });

                            var compareMembers = function (a, b) {
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
                            };

                        });
                    }

                    return deferred.promise;
                }

                /**
                 * If current user is not focused on chat or browser tab
                 * notify by changes tab title or chatroom with unread
                 * messages count
                 *
                 * @param chatroom
                 */
                function notifyUserIfChatNotActive(chatroom) {
                    if ($rootScope.tabFocused === false) {
                        messagesSinceTabBlur++;

                        var title = $('#metadata_title').text();

                        Helpers.updateMetadata({
                            title: '(' + messagesSinceTabBlur + ') ' + title.replace(/^\([0-9]+\)/, '')
                        });
                    }

                    if (!$state.is('app.chat.show') || ($state.is('app.chat.show') && !chatroom.isActive())) {
                        chatroom.incrementUnreadMessagesCount();
                    }
                }

                /**
                 * Ping user when found
                 *
                 * @param chatroom
                 * @param message
                 */
                function pingUser(chatroom, message) {
                    var pattern = '@' + $rootScope.currentUser.username + '\\b';
                    var regex = new RegExp(pattern, 'gi');
                    var chatroomIsPrivate = chatroom.type === 'private';
                    var chatroomNotFocused = chatroom.title !== activeChatroom.title || !$state.is('app.chat.show');

                    if (regex.test(message.body) || chatroomIsPrivate && chatroomNotFocused) {
                        pingSound.play();
                        var enabled = false;

                        if ($window.Notification) {
                            switch ($window.Notification.permission) {
                                case 'granted':
                                    enabled = true;
                                    break;
                                case 'default':
                                case 'denied':
                                    $window.Notification.requestPermission();

                                    if ($window.Notification.permission === 'granted') {
                                        enabled = true;
                                    }
                                    break;
                            }
                        }

                        if (enabled && !($rootScope.tabFocused && activeChatroom.channel === message.channel)) {
                            var noti = new $window.Notification(message.channel.substr(4) + ' - @' + message.sender.username, {
                                body: message.body,
                                icon: message.sender.picture_xs
                            });

                            $timeout(function () {
                                noti.close();
                            }, 6000);

                            noti.onclick = function () {
                                noti.close();
                                $window.focus();

                                if (activeChatroom.channel !== message.channel) {
                                    var chatroom = findChatroom({channel: message.channel});

                                    if (chatroom) {
                                        chatroom.setAsActiveChatroom();

                                        if ($state.current.name === 'app.chat.show') {
                                            $rootScope.$broadcast('change-chatrooms', chatroom);
                                        }
                                    }
                                }
                            };
                        }
                    }
                }

                /**
                 * For chatroom channel
                 *
                 * @param userA
                 * @param userB
                 * @returns {string}
                 */
                function generatePrivateChatroomSuffix(userA, userB) {
                    var suffix = '';

                    if (userA.id < userB.id)
                        suffix += userA.id + '_' + userB.id;
                    else
                        suffix += userB.id + '_' + userA.id;

                    return suffix;
                }

                /**
                 *
                 * @param chatroom
                 */
                function setMetaDataFor(chatroom) {
                    if (chatroom) {
                        if (chatroom.description_short) {
                            Helpers.updateMetadata({
                                description: chatroom.description_short + ' | Find a #hashtag of whatever you love - music, sports, games - and join the party. Add friends, invite them to your favorite #hashtags and enjoy or host private chat rooms within your social network.'
                            });
                        }
                        if (chatroom.tab_title) {
                            Helpers.updateMetadata({
                                title: chatroom.tab_title + ' | Finit'
                            });
                        } else {
                            if (chatroom.type === 'public') {
                                Helpers.updateMetadata({
                                    title: '#' + chatroom.title.replace('#', '').capitalizeFirstLetter() + ' chat | Finit'
                                });
                            } else {
                                Helpers.updateMetadata({
                                    title: chatroom.title + ' | Finit'
                                });
                            }
                        }
                    }
                }

                /**
                 * Update url without changing state
                 *
                 * @param chatroom
                 */
                function updateUrl(chatroom) {
                    //$stateParams.title = chatroom.title.replaceAll({'#': ''});
                    var ua = navigator.userAgent;
                    var isKindle = /Kindle/i.test(ua) || /Silk/i.test(ua) || /KFTT/i.test(ua) || /KFOT/i.test(ua) || /KFJWA/i.test(ua) || /KFJWI/i.test(ua) || /KFSOWI/i.test(ua) || /KFTHWA/i.test(ua) || /KFTHWI/i.test(ua) || /KFAPWA/i.test(ua) || /KFAPWI/i.test(ua);

                    if (isKindle) {
                        var deferred = $q.defer();

                        $timeout(function () {
                            deferred.resolve(true);
                        }, 5);

                        return deferred.promise;
                    }

                    if (chatroom.type === 'protected') {
                        return $state.go('app.chat.show', {title: chatroom.channel.substr(3)}, {notify: false});
                    } else {
                        return $state.go('app.chat.show', {title: chatroom.title.replaceAll({'#': ''})}, {notify: false});
                    }
                }

                return service;
            }
        );
})();