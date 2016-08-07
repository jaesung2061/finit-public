(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('ChatShowSidenavController', function ($scope
            , WebSocketsService
            , FavoritesService
            , FriendsService
            , DialogService
            , PollsService
            , ToastService
            , ChatService
            , Restangular
            , $rootScope
            , $mdSidenav
            , $timeout
            , Helpers
            , $state) {

            $scope.chatrooms = ChatService.getChatrooms();
            $scope.pollFormData = {
                question: '',
                options: []
            };
            $scope.optionsCount = [1, 2];
            $scope.voteFormData = {};
            $scope.claimFormData = {};
            $scope.inviteFormData = {};

            $scope.postPoll = function (chatroom, formData) {
                if (!$scope.pollSubmitInProgress) {
                    $scope.pollSubmitInProgress = true;

                    formData.chatroom_channel = chatroom.channel;

                    PollsService.postPoll(formData, chatroom).then(function (poll) {
                        $scope.pollSubmitInProgress = false;
                        $scope.pollErrors = false;
                        $scope.pollFormData = {};

                        if (!chatroom.newPolls || chatroom.newPolls.length > 0)
                            chatroom.newPolls = [];

                        chatroom.newPolls.push(PollsService.calculatePercentages(poll));

                        chatroom.notify('new-poll', poll);
                    }, function () {
                        $scope.pollErrors = true;
                        $scope.pollSubmitInProgress = false;
                    });
                }
            };
            $scope.pushNewOption = function ($event) {
                // $event is injected on keypress
                if (!$event && $scope.optionsCount.length < 10) {
                    $scope.optionsCount.push($scope.optionsCount.length + 1);
                }
            };
            $scope.viewNewPoll = function (chatroom) {
                var newPoll = chatroom.newPolls.splice(0, 1)[0],
                    id = newPoll.restangularized ? newPoll.data.id : newPoll.id;

                Restangular.all('polls').get(id).then(function (response) {
                    chatroom.poll = PollsService.calculatePercentages(response.data);
                });
            };
            $scope.submitVote = function (chatroom) {
                if (!$scope.voteFormData.option) return;

                $scope.voteFormData.poll_id = chatroom.poll.id;

                Restangular.one('polls', chatroom.poll.id).post('vote', $scope.voteFormData).then(function (response) {
                    $scope.voteOption = null;
                    chatroom.poll = PollsService.calculatePercentages(response.data);
                });
            };
            $scope.changePoll = function (direction) {
                var nextPage;

                if (direction === 'next' && $scope.chatroom.pollMeta.current_page < $scope.chatroom.pollMeta.last_page)
                    nextPage = $scope.chatroom.pollMeta.current_page + 1;
                else if (direction === 'previous' && $scope.chatroom.pollMeta.current_page > 1)
                    nextPage = $scope.chatroom.pollMeta.current_page - 1;
                else return;

                $scope.chatroom.pollMeta.current_page = nextPage;

                PollsService.getPoll($scope.chatroom).then(function (response) {
                    $scope.chatroom.pollMeta = response.meta;
                    $scope.chatroom.poll = PollsService.calculatePercentages(response[0]);
                });
            };
            $scope.toggleFavorite = function (chatroom, checkBoxWasClicked) {
                if (!checkBoxWasClicked) {
                    if (chatroom.isFavorite) {
                        FavoritesService.removeFavorite(chatroom).then(function () {
                            chatroom.isFavorite = false;
                        });
                    } else {
                        FavoritesService.addFavorite(chatroom).then(function () {
                            chatroom.isFavorite = true;
                        });
                    }
                } else {
                    // Reverse it because the ng-model fucks with the chatroom isFavorite attribute
                    if (!chatroom.isFavorite) {
                        FavoritesService.removeFavorite(chatroom).then(function () {
                            chatroom.isFavorite = false;
                        });
                    } else {
                        FavoritesService.addFavorite(chatroom).then(function () {
                            chatroom.isFavorite = true;
                        });
                    }
                }
            };
            $scope.openInviteDialog = function () {
                DialogService.fromTemplate('invite', $scope).then(function () {
                    //
                });
            };
            $scope.close = function () {
                $mdSidenav('right').close()
                    .then(function () {
                        //
                    });
            };
            $scope.sendRequest = function (chatroom, userId) {
                FriendsService.sendRequest(userId, 'Friend request sent.');

                $timeout(function () {
                    Helpers.setIsFriendAttributes(chatroom);
                }, 1000);
            };
            $scope.requestModPowers = function (chatroom) {
                Restangular.all('moderators').post({channel: chatroom.channel}).then(function (response) {
                    ToastService.show('Request has been made');
                });
            };
            $scope.claimHashtag = function (chatroom) {
                Restangular.one('chatrooms', chatroom.channel).patch({type: 'claim'}).then(function (response) {
                    $scope.chatroom.owner_id = response.data.owner_id;
                    ToastService.show('You have claimed #' + chatroom.title.replace('#', '') + '. You can now view the dashboard and make changes to the hashtag settings.', 10);
                    $state.go('app.chat.show.dashboard', {title: chatroom.title});
                }, function (response) {
                    ToastService.error(response.data);
                });
            };
            $scope.openDescriptionTab = function () {
                $timeout(function () {
                    $('#descriptions-tab').trigger('click');
                }, 1);
            };
            $scope.refreshMembers = function (chatroom) {
                chatroom.members = [];
                WebSocketsService.refreshMembers(chatroom);
            };
            $scope.openHelpMenu = function () {
                DialogService.fromTemplate('help');
            };
            $scope.sendInvites = function (chatroom) {
                var usernames = $scope.inviteFormData.username
                    .replaceAll({' ': '', '@': ''})
                    .split(',')
                    .filter(function (n) {
                        return n != ''
                    });

                Restangular.all('invites').post({
                    invites: usernames,
                    channel: chatroom.channel
                }).then(function (response) {
                    ToastService.show('Invite has been sent');
                });
            };

        });
})();
