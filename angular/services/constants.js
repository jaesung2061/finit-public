(function () {
    "use strict";

    angular.module("app.services")
        .constant('EVENTS', {
            auth: {
                loginSuccess: 'auth-login-success',
                loginFailed: 'auth-login-failed',
                logoutSuccess: 'auth-logout-success',
                sessionTimeout: 'auth-session-timeout',
                notAuthenticated: 'auth-not-authenticated',
                notAuthorized: 'auth-not-authorized'
            },
            friends: {
                friendListReceived: 'friend-list-received',
                requestListReceived: 'friend-request-list-received'
            },
            notifications: {
                notificationsReceived: 'notifications-received',
                event: window.Finit.notification_events
            },
            boxes: {
                requesting: 'box-list-requesting',
                received: 'box-list-received',
                added: 'box-added',
                removed: 'box-removed'
            },
            chat: {
                messagesReceived: 'chat-messages-received',
                messageReceived: 'chat-message-received',
                messageSent: 'chat-message-sent',
                notificationEvent: 'chat-notification-event'
            }
        })
        .constant('FACES', {
            '\\bhi\\b': '(^.^)ノ',
            '\\blenny\\b': '( ͡° ͜ʖ ͡°)',
            '\\bidk\\b': '¯\\_(ツ)_/¯',
            '\\bsrs\\b': 'ಠ_ಠ',
            '\\bfliptable\\b': '(╯°□°）╯︵ ┻━┻',
            '\\btableflip\\b': '(╯°□°）╯︵ ┻━┻',
            '\\bunflip\\b': '┬─┬ノ( º _ ºノ)',
            '\\bdoubleflip\\b': '┻┻︵ ╰(°□°)╯︵ ┻┻',
            '\\bflipyou\\b': '（╯°□°）╯︵(\\ .o.)\\',
            '\\bunflipyou\\b': '(^.^)ノ( º _ ºノ)',
            '\\byay\\b': '╰(◕ᗜ◕)╯',
            '\\bhug\\b': '(つ°ヮ°)つ',
            '\\bdenko\\b': '(´・ω・`)'
        });

})();