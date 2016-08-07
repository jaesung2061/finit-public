(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('SettingsController', function ($rootScope, $scope, Restangular, Upload, ToastService, Session, FileReaderService, EVENTS, Helpers) {
            var Users = Restangular.all('users');

            Helpers.whenCtrlReady(initializeController);

            $scope.submit = function (formData, type) {
                formData.type = type;

                if (!$scope.submitting) {
                    $scope.submitting = true;
                    Restangular.one('users', $rootScope.currentUser.id).patch(formData).then(function (response) {
                        $scope.submitting = false;
                        switch (type) {
                            case 'profile':
                                $rootScope.currentUser = response.data;
                                return ToastService.show('Your profile has been updated.');
                            case 'email':
                                delete formData.email_new;
                                delete formData.email_new_confirmation;
                                delete formData.password;
                                return ToastService.show('Your email has been reset.');
                            case 'password':
                                delete formData.password_current;
                                delete formData.password_new;
                                delete formData.password_new_confirmation;
                                return ToastService.show('A confirmation email has been sent.');
                        }
                    }, function (response) {
                        $scope.submitting = false;
                        $scope.errors = response.data;
                        scrollTo(angular.element('validation').position().top);
                    });
                }
            };
            $scope.uploadPhoto = function () {
                if (!$scope.uploadingPicture && !!$scope.cropOptions.croppedImage) {
                    $scope.uploadingPicture = true;

                    ToastService.show('Uploading photo...');

                    Upload.upload({
                        url: '/api/users/photo',
                        method: 'POST',
                        headers: {Authorization: 'Bearer ' + Session.getToken()},
                        file: dataURItoBlob($scope.cropOptions.croppedImage),
                        data: $scope.boxFormData
                    }).success(function (response) {
                        $scope.cropOptions = {
                            croppedImage: null,
                            sourceImage: null,
                            width: 512,
                            height: 512
                        };
                        $scope.uploadingPicture = false;

                        ToastService.show('Your profile picture has been updated. Refresh for it to take effect.');
                    }).error(function () {
                        $scope.uploadingPicture = false;
                        ToastService.error('Sorry, something went wrong.');
                    });
                }
            };
            $scope.onFileSelect = buildOnFileSelectFunction($scope, FileReaderService);

            /**
             * Initialize controller
             */
            function initializeController() {
                $scope.cropOptions = {
                    croppedImage: null,
                    sourceImage: null,
                    width: 512,
                    height: 512
                };
                $scope.formData = {
                    bio: $rootScope.currentUser.bio,
                    website: $rootScope.currentUser.website
                };
                $scope.privacy = !!$rootScope.currentUser.is_private;

                $scope.$watch('privacy', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        Restangular.one('users', $rootScope.currentUser.id).patch({
                            privacy: newValue,
                            type: 'privacy'
                        }).then(function (response) {
                            $rootScope.currentUser = response.data;
                            if (response.data.is_private) {
                                ToastService.show('Your profile has been set to private.');
                            } else {
                                ToastService.show('Your profile is no longer private.');
                            }
                        }, function (response) {
                            $scope.profileErrors = response.data;
                        });
                    }
                });
            }
        });

})();
