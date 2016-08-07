(function () {
    "use strict";

    angular.module('app.services')
        .factory('Helpers', function ($rootScope, Session, EVENTS, FriendsService) {
            var service = this;

            /**
             * When service is ready.
             *
             * @param initCtrl
             */
            service.whenCtrlReady = function (initCtrl) {
                if (Session.user) {
                    initCtrl();
                } else if (!Session.authRequestComplete) {
                    $rootScope.$on(EVENTS.auth.loginSuccess, function () {
                        initCtrl();
                    });
                    $rootScope.$on(EVENTS.auth.loginFailed, function () {
                        initCtrl();
                    });
                }
            };
            /**
             * Loops through chatroom members and checks
             * if they are friend of current user, sets
             * isFriend to true if they are.
             *
             * @param chatroom
             */
            service.setIsFriendAttributes = function (chatroom) {
                var length = chatroom.members.length,
                    friend, i;

                for (i = 0; i < length; i++) {
                    friend = _.find(FriendsService.friends, {id: chatroom.members[i].id});
                    chatroom.members[i].isFriend = !!friend;
                }
            };
            /**
             * Update metadata
             *
             * @param data
             */
            service.updateMetadata = function (data) {
                if (data.title) {
                    $('#metadata_title').text(data.title);
                } else {
                    $('#metadata_title').text('Finit - Hashtag Chatting');
                }
                if (data.description) {
                    $('#metadata_description').attr('content', data.description);
                }
            };

            return service;
        });

})();
