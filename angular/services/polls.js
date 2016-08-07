(function () {
    "use strict";

    angular.module('app.services')
        .factory('PollsService', [
            '$http',
            'Session',
            'Restangular',
            function ($http, Session, Restangular) {
                var service = this,
                    Polls = Restangular.all('polls');

                service.getPoll = function (chatroom, perPage) {
                    return Polls.getList({
                        suffix: chatroom.suffix,
                        page: chatroom.pollMeta ? chatroom.pollMeta.current_page : 1,
                        perPage: perPage || 1
                    });
                };
                service.postPoll = function (formData, chatroom) {
                    formData.chatroom = {
                        title: chatroom.title,
                        suffix: chatroom.suffix,
                        isPrivate: chatroom.isPrivate,
                        isPublic: chatroom.isPublic,
                        isProtected: chatroom.isProtected
                    };

                    return Polls.post(formData);
                };
                service.calculatePercentages = function (poll) {
                    var sum = 0,
                        key;

                    poll.votePercentages = {};

                    for (key in poll.votes) {
                        sum += poll.votes[key];
                    }

                    for (key in poll.votes) {
                        if (sum > 0) {
                            poll.votePercentages[key] = poll.votes[key] / sum * 100;
                        } else {
                            poll.votePercentages[key] = 0;
                        }
                    }

                    return poll;
                };

                return service;
            }]);

})();
