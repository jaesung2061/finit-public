(function () {
    "use strict";

    angular.module('app.services')
        .provider('WebSocketsService', function () {
            var options = null;

            return {
                setOptions: function (obj) {
                    options = obj || {};
                },
                $get: function ($rootScope, $timeout, $interval, EVENTS, ToastService, $localStorage) {
                    var service = this,
                        eventListenersRegistry = [];

                    service.ws = null;
                    service.connected = false;
                    service.attemptingReconnection = false;
                    service.connectionSuccessEvent = 'ws-connected';
                    service.disconnectionEvent = 'ws-disconnected';
                    service.presenceEvent = 'ws-presence-received';
                    service.notificationEvent = 'ws-notification-received';

                    $rootScope.$on(EVENTS.auth.loginSuccess, function (event, data) {
                        if (typeof options !== 'object')
                            options = deparam(options);

                        options.token = data.token;
                        options = angular.element.param(options);

                        initializeWebSocket();
                    });
                    $rootScope.$on(service.disconnectionEvent, function () {
                        if (!$rootScope.currentUser) return;

                        // Random float between 0 and 1 seconds
                        var randomDelayTime = Math.random() * 2;

                        // Why the randomly generated delay?
                        // If the websocket server goes down, all clients will synchronously
                        // attempt reconnection. When the WS server goes back online, the
                        // simultaneous requests will crash the server. To prevent self
                        // inflicted DDOS, we will randomize each client's start time
                        // over a five second period for safe reboot of server.
                        //$timeout(function () {
                            attemptReconnection();
                        //}, randomDelayTime);
                    });
                    $(window).on('beforeunload', function () {
                        service.reset();
                    });

                    service.subscribe = function (chatroom, callback) {
                        callback(chatroom.channel);
                        service.ws.send(JSON.stringify({
                            event: 'subscribe',
                            channel: chatroom.channel,
                            type: chatroom.type
                        }));
                    };
                    service.unsubscribe = function (channel) {
                        channel = channel || 'nba';

                        tryCatch(function () {
                            service.ws.send(JSON.stringify({
                                event: 'unsubscribe',
                                channel: channel
                            }));
                        });

                        // Remove event listeners for channel
                        for (var key in eventListenersRegistry) {
                            // If string beings with 'myChannel|', remove it
                            if (key.substring(0, channel.length + 1) === channel + '|') {
                                delete eventListenersRegistry[key];
                            }
                        }
                    };
                    service.sendMessage = function (channel, message) {
                        service.ws.send(JSON.stringify({
                            event: 'client-message',
                            channel: channel,
                            data: {
                                channel: channel,
                                body: message,
                                wss_token: $localStorage.wss_token
                            }
                        }));
                    };
                    service.refreshMembers = function (chatroom) {
                        service.ws.send(JSON.stringify({
                            event: 'refresh-members',
                            channel: chatroom.channel
                        }));
                    };
                    service.on = function (channel, event, handler) {
                        var eventName = channel + '|' + event,
                            eventHandlers = eventListenersRegistry[eventName],
                            newEventHandlers = [];

                        if (!eventHandlers) {
                            eventListenersRegistry[eventName] = newEventHandlers;
                        }

                        newEventHandlers.push(handler);

                        // Return a function to remove event handler
                        return function () {
                            _.remove(newEventHandlers, function (registeredHandler) {
                                return registeredHandler === handler;
                            });

                            // If no handlers registered, remove event listener
                            if (newEventHandlers.length === 0) {
                                delete eventListenersRegistry[eventName];
                            }
                        };
                    };
                    service.off = function (channel, event) {
                        // THIS REMOVES ALL CALLBACKS ON LISTENER
                        for (var key in eventListenersRegistry) {
                            if (key === (channel + '|' + event)) {
                                return delete eventListenersRegistry[key];
                            }
                        }
                    };
                    service.clearListeners = function () {
                        eventListenersRegistry = [];
                    };
                    service.getOnlineFriends = function (friendIds) {
                        if (service.ws && service.ws.readyState === 1) {
                            service.ws.send(JSON.stringify({
                                event: 'presence-request',
                                friendIds: friendIds
                            }));
                        } else {
                            $rootScope.$on(service.connectionSuccessEvent, function () {
                                service.ws.send(JSON.stringify({
                                    event: 'presence-request',
                                    friendIds: friendIds
                                }));
                            });
                        }
                    };
                    service.reset = function () {
                        tryCatch(function () {
                            service.ws.close();
                        });
                        service.ws = null;
                        service.connected = false;
                        service.clearListeners();
                    };
                    window.sendChatMessage = function (channel, body) {
                        service.sendMessage(channel, body);
                    };

                    function initializeWebSocket() {
                        service.ws = new WebSocket(Finit.ws.protocol + Finit.ws.url + '?' + (options || ''));
                        service.ws.onclose = onWSClose;
                        service.ws.onmessage = onWSMessage;
                    }

                    function onWSClose(event) {
                        if (service.ws !== null) {
                            service.ws = null;
                            service.connected = false;

                            if (!service.attemptingReconnection && event.code !== 4000) {
                                $rootScope.$broadcast(service.disconnectionEvent);
                            }
                        }
                    }

                    function onWSMessage(messageEvent) {
                        var data = JSON.parse(messageEvent.data);

                        if (isNumeric(data.event)) {
                            $rootScope.$broadcast(service.notificationEvent, data);
                        } else {
                            if (window.onWebSocketEvent) {
                                window.onWebSocketEvent(data);
                            }

                            switch (data.event) {
                                case 'connected':
                                    service.connected = true;
                                    $rootScope.$broadcast(service.connectionSuccessEvent);
                                    initiatePingTesting();
                                    break;
                                case 'disconnected-forced':
                                    //
                                    break;
                                case 'online-friends':
                                    break;
                                case 'wss_token':
                                    $localStorage.wss_token = generateRandomString();
                                    break;
                                case 'client-connected':
                                case 'client-disconnected':
                                    $rootScope.$broadcast(service.presenceEvent, data);
                                    break;
                                case 'command-success':
                                    switch (data.type) {
                                        case 'ban':
                                            return ToastService.show('You have banned ' + data.subject + ' from #' + data.channel.substr(4, data.channel.length));
                                        case 'unban':
                                            return ToastService.show('You have unbanned ' + data.subject + ' from #' + data.channel.substr(4, data.channel.length));
                                        case 'kick':
                                            return ToastService.show('You have kicked ' + data.subject + ' from #' + data.channel.substr(4, data.channel.length));
                                    }
                                    break;
                                case 'unbanned-from-channel':
                                    return ToastService.show('You have been unbanned from #' + data.channel.substr(4, data.channel.length));
                                case 'excessive-messaging':
                                    return ToastService.error('You are sending too many messages. You must wait 1 minute before sending messages again.');
                                case 'refreshed-members':
                                    return $rootScope.$broadcast('refreshed-members', data);
                                case 'restricted':
                                    return ToastService.error(data.message);
                                case 'chatroom-state-change':
                                    return $rootScope.$broadcast('chatroom-state-change', data);
                                case 'user-state-change':
                                    return $rootScope.$broadcast('user-state-change', data);
                                default:
                                    executeEventHandlers(data);
                            }
                        }
                    }

                    function executeEventHandlers(data) {
                        // Loop through registered event handlers,
                        // If one is found, executed the registered callbacks
                        for (var eventListenerKey in eventListenersRegistry) {
                            // If match is found
                            if ((data.channel + '|' + data.event) === eventListenerKey) {
                                // Loop through registered handler callbacks and execute them
                                for (var i = 0; i < eventListenersRegistry[eventListenerKey].length; i++) {
                                    eventListenersRegistry[eventListenerKey][i](data);
                                }
                            }
                        }
                        $rootScope.$apply();
                    }

                    function attemptReconnection() {
                        var interval;

                        // todo when working with chat, do not remove
                        // Try to reconnect once every 5 seconds for a minute
                        if ($rootScope.currentUser && !service.attemptingReconnection) {
                            // This is to prevent multiple intervals
                            // from running, we only need 1 interval
                            service.attemptingReconnection = true;

                            ToastService.error('Connection has failed! Attempting reconnection...');

                            interval = $interval(function () {
                                // Attempt to initialize
                                initializeWebSocket();

                                // Check if ws has successfully connected after 2.5 seconds just to be safe
                                $timeout(function () {
                                    if (service.ws && service.ws.readyState === 1) {
                                        // Success, clear interval
                                        $interval.cancel(interval);
                                        service.attemptingReconnection = false;
                                        ToastService.show('Reconnection successful!');
                                    } else {
                                        tryCatch(function () {
                                            service.ws.close();
                                        });

                                        service.ws = null;
                                    }
                                }, 1500);
                            }, 2000);
                        }
                    }

                    function initiatePingTesting() {
                        var interval = $interval(function () {
                            service.ws.send(JSON.stringify({event: 'ping'}));
                        }, 1000 * 60 * 2.5);

                        $rootScope.$on(service.disconnectionEvent, function () {
                            $interval.cancel(interval);
                        })
                    }

                    function generateRandomString() {
                        var text = "";
                        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                        for (var i = 0; i < 5; i++)
                            text += possible.charAt(Math.floor(Math.random() * possible.length));

                        return text;
                    }

                    return service;
                }
            };
        });

})();
