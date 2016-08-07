(function(){
	"use strict";

	angular.module('app.directives')
        .directive('friendButtons', function () {

            return {
                restrict: 'E',
                templateUrl: 'views/directives/friend-buttons/friend-buttons.html',
                controller: 'FriendButtonsController',
                scope: {
                    user: '=',
                    currentUser: '='
                },
                link: function ($scope, $element, $attrs) {
                    //
                }
            };

        });

})();
