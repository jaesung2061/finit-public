(function(){
	"use strict";

	angular.module('app.directives')
        .directive('imgCrop', function () {

            return {
                restrict: 'EA',
                templateUrl: 'views/directives/img-crop/img-crop.html',
                controller: 'ImgCropController',
                scope: {
                    cropOptions: '='
                },
                link: function ($scope, $element, $attrs) {
                    //
                }
            };

        });

})();
