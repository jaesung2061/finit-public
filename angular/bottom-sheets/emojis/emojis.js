(function () {

    angular.module('app.controllers')
        .controller('EmojisBottomSheetController', function ($scope, $mdBottomSheet) {

            $scope.selected = '';

            $scope.appendEmoji = function ($event) {
                $scope.selected += ' ' + $($event.target).data('emoji-value') + ' ';
            };

            $scope.hide = function (sendMessage) {
                $mdBottomSheet.hide({
                    emojis: $scope.selected,
                    sendMessage: sendMessage
                });
            };

        });

})();
