(function(){
	"use strict";

	angular.module('app.controllers')
        .controller('ImgCropController', function ($scope, FileReaderService) {
			$scope.onFileSelect = function ($files) {
				if ($files && $files.length > 0) {
					FileReaderService.readAsDataUrl($files[0], $scope).then(function (result) {
						$scope.cropOptions.sourceImage = result;
						$scope.cropOptions.cropperReady = true;
					});
				}
			};
        });

})();
