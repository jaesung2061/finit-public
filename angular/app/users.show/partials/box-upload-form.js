(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('BoxFormController', function ($rootScope, $scope, $mdDialog, Restangular, FileReaderService, Upload, Session, ToastService, EVENTS) {
            var Boxes = Restangular.all('boxes');
            var $parent = $scope.$parent.$parent;
            var submitting;

            $scope.boxFormStep = 1;
            $scope.colors = [
                'grey', 'red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal',
                'green', 'light-green', 'lime', 'yellow', 'amber', 'orange', 'deep-orange', 'brown', 'blue-grey'
            ];
            $scope.boxFormData = {type: 'text', color: 'grey'};
            $scope.cropOptions = {
                croppedImage: null,
                sourceImage: null,
                width: 209,
                height: 209
            };
            $scope.previewClass = '';

            $scope.selectBoxSize = function (width, height) {
                // If they resized the box, undo cropped image
                if (width !== $scope.boxFormData.width || height !== $scope.boxFormData.height) {
                    $scope.cropperReady = false;
                    $scope.cropOptions.sourceImage = null;
                    $scope.cropOptions.croppedImage = null;
                }

                $scope.boxFormData.width = width;
                $scope.boxFormData.height = height;
                $scope.boxFormStep = 2;

                if (width === 1) {
                    $scope.cropOptions.width = 209;
                } else if (width === 2) {
                    $scope.cropOptions.width = 428;
                }

                if (height === 1) {
                    $scope.cropOptions.height = 209;
                } else if (height === 2) {
                    $scope.cropOptions.height = 428;
                }

                generatePreviewClass();
            };
            $scope.selectBoxColor = function (color) {
                $scope.boxFormData.color = color;
                $scope.cropOptions.sourceImage = null;
                $scope.cropOptions.croppedImage = null;
                $scope.cropperReady = false;
                generatePreviewClass();
            };
            $scope.submit = function (formData) {
                if (submitting) return;

                submitting = true;
                formData.taker_id = $scope.$parent.user.id;

                if (!$scope.cropOptions.croppedImage) {
                    Boxes.post(formData).then(function (response) {
                        onBoxSubmitSuccess(response);
                    }, function (response) {
                        $scope.boxUploadErrors = response.data;
                    });
                } else {
                    if (!$scope.uploadingPicture) {
                        $scope.uploadingPicture = true;

                        $scope.boxFormData.taker_id = $scope.$parent.user.id;
                        $scope.boxFormData.color = 'grey';

                        Upload.upload({
                            url: '/api/boxes/photo',
                            method: 'POST',
                            headers: {Authorization: 'Bearer ' + Session.getToken()},
                            file: dataURItoBlob($scope.cropOptions.croppedImage),
                            data: $scope.boxFormData
                        }).success(function (response) {
                            onBoxSubmitSuccess(response);

                            $scope.cropOptions = {
                                croppedImage: null,
                                sourceImage: null,
                                width: 209,
                                height: 209
                            };
                            $scope.uploadingPicture = false;

                            ToastService.show('Photo uploaded');
                        }).error(function () {
                            $scope.uploadingPicture = false;
                            ToastService.error('Sorry, something went wrong');
                        });
                    }
                }
            };
            $scope.onFileSelect = buildOnFileSelectFunction($scope, FileReaderService);

            function generatePreviewClass() {
                $scope.previewClass = 'wall-box ';

                if ($scope.boxFormData.width === 2) {
                    $scope.previewClass += 'box-width-2 ';
                }
                if ($scope.boxFormData.height === 2) {
                    $scope.previewClass += 'box-height-2 ';
                }

                $scope.previewClass += 'md-color ' + $scope.boxFormData.color + ' hue-300';
            }

            function onBoxSubmitSuccess(response) {
                $scope.boxFormData = {type: 'text', color: 'grey'};
                $parent.boxes.unshift(response.data);
                $parent.$broadcast(EVENTS.boxes.added, response.data.id);
                $scope.$emit(EVENTS.boxes.added);
            }
        });
})();
