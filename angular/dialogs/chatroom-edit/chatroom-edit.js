(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('ChatroomEditDialogController', function ($rootScope, $scope, Restangular, DialogService, ToastService, Session, EVENTS, Upload, FileReaderService, CommandsService, chatroom) {
            var Chatrooms = Restangular.all('chatrooms');
            var Chatroom = Restangular.one('chatrooms', chatroom.channel);
            var Moderators = Restangular.all('moderators');
            var Rules = Restangular.all('rules');

            $scope.chatroom = chatroom;
            $scope.collapseMarkdownHelp = true;
            $scope.chatInfoErrors = null;
            $scope.banFormData = {};
            $scope.modFormData = {};
            $scope.currentUser = $rootScope.currentUser; // For some reason we can't access it without doing this
            $scope.cropOptions = {
                croppedImage: null,
                sourceImage: null,
                width: 128,
                height: 128,
                small: true
            };

            getBans();
            Chatrooms.get(chatroom.channel).then(function (response) {
                $scope.formData = {
                    description: response.data.description,
                    description_short: response.data.description_short,
                    tab_title: response.data.tab_title
                };

                // TODO
                if (response.data.settings) {
                    tryCatch(function () {
                        $scope.formData.settings = JSON.parse(response.data.settings);
                        $scope.watchSettings = $scope.$watch('formdata.settings.mode', function (oldValue, newValue) {
                            console.log(oldValue, newValue);
                        });
                    });
                }
            });
            Moderators.getList({channel: chatroom.channel}).then(function (response) {
                $scope.mods = response;
            });

            $scope.updateChatInfo = function () {
                $scope.formData.type = 'update';

                Chatroom.patch($scope.formData).then(function (response) {
                    chatroom.tab_title = response.data.tab_title;
                    chatroom.description_ahort = response.data.description_ahort;
                    chatroom.description = response.data.description;
                    $scope.hide();
                }, function (response) {
                    $scope.chatInfoErrors = response.data;
                });
            };
            $scope.unbanUsers = function () {
                for (var i = 0; i < $scope.bans.length; i++) {
                    if ($scope.bans[i].unban === true) {
                        (function (i) {
                            Restangular.all('commands/execute').post({
                                command: 'unban',
                                args: [$scope.bans[i].user.username],
                                channel: chatroom.channel
                            }).then(function (response) {
                                getBans();
                                $scope.banFormData.username = '';
                            }, function (response) {
                                ToastService.error(response.data);
                            });
                        })(i);
                    }
                }

                ToastService.show('Unbanned users.');
            };
            $scope.banUser = function () {
                Restangular.all('commands/execute').post({
                    command: 'ban',
                    args: [$scope.banFormData.username.replace('@', '')],
                    channel: chatroom.channel
                }).then(function (response) {
                    getBans();
                    ToastService.show('You have banned ' + $scope.banFormData.username + ' from #' + chatroom.title + '.');
                    $scope.banFormData.username = '';
                }, function (response) {
                    ToastService.error(response.data);
                });
            };
            $scope.demodUsers = function () {
                var usersToDemod = [];

                for (var i = 0; i < $scope.mods.length; i++) {
                    if ($scope.mods[i].demod === true) {
                        usersToDemod.push($scope.mods[i].user.id);
                        (function (i) {
                            Restangular.one('moderators', $scope.mods[i].id).remove({channel: chatroom.channel}).then(function (response) {
                                $scope.mods.splice(i, 1);
                            });
                        })(i);
                    }
                }

                ToastService.show('Demodded users.');
            };
            $scope.modUser = function (chatroom) {
                $scope.modFormData.channel = chatroom.channel;
                Restangular.all('moderators').post($scope.modFormData).then(function (response) {
                    $scope.mods.push(response.data);
                    ToastService.show('You have promoted ' + response.data.user.username + ' to moderator.');
                    $scope.modFormData = {};
                });
            };
            $scope.hide = function () {
                DialogService.hide();
            };
            $scope.disclaimHashtag = function (chatroom) {
                Chatroom.patch({type: 'disclaim'}).then(function (response) {
                    $scope.chatroom.owner_id = 0;
                    ToastService.show('You no longer own this hashtag.');
                    $rootScope.currentUser.chatroom = null;
                    $scope.hide();
                });
            };
            $scope.uploadPhoto = function () {
                if (!$scope.uploadingPicture && !!$scope.cropOptions.croppedImage) {
                    $scope.uploadingPicture = true;

                    Upload.upload({
                        url: '/api/chatrooms/photo',
                        method: 'POST',
                        headers: {Authorization: 'Bearer ' + Session.getToken()},
                        file: dataURItoBlob($scope.cropOptions.croppedImage),
                        data: {channel: chatroom.channel}
                    }).success(function (response) {
                        $scope.cropOptions = {
                            croppedImage: null,
                            sourceImage: null,
                            width: 128,
                            height: 128,
                            small: true
                        };
                        $scope.uploadingPicture = false;

                        ToastService.show('Chatroom avatar has been updated.');
                    }).error(function () {
                        $scope.uploadingPicture = false;
                        ToastService.error('Sorry, something went wrong.');
                    });
                }
            };
            $scope.onFileSelect = buildOnFileSelectFunction($scope, FileReaderService);

            function getBans() {
                Rules.getList({channel: chatroom.channel, type: 'ban'}).then(function (response) {
                    $scope.bans = response;
                });
            }
        });

})();
