(function () {
    "use strict";

    angular.module('app.controllers')
        .controller('SelectPhotoController', function ($scope, DialogService, Upload, FileReaderService) {
            $scope.cropperReady = true;

            $scope.save = function () {
                //
            };
            $scope.hide = function () {
                DialogService.hide();
            };
            $scope.onFileSelect = function ($files) {
                if ($files && $files.length > 0) {
                    FileReaderService.readAsDataUrl($files[0], $scope)
                        .then(function (result) {
                            $scope.sourceImage = result;
                        });
                    $scope.croppedImage = $files[0];
                }
            };

        });

})();
