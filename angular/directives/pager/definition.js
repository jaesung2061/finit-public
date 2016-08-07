(function () {
    "use strict";

    angular.module('app.directives')
        .directive('pager', function () {
            return {
                restrict: 'EA',
                templateUrl: 'views/directives/pager/pager.html',
                controller: 'PagerController',
                scope: {
                    metaData: '=',
                    pagerAction: '=',
                    theme: '@'
                },
                link: function ($scope, $element, $attrs) {
                    if ($attrs.pagerButtons === 'null') {
                        $scope.previous = '';
                        $scope.next = '';
                    } else if ($attrs.pagerButtons) {
                        $scope.previous = $attrs.pagerButtons.split(' ')[0] || 'Previous';
                        $scope.next = $attrs.pagerButtons.split(' ')[1] || 'Next';
                    } else {
                        $scope.previous = 'Previous';
                        $scope.next = 'Next';
                    }
                }
            };
        });

})();
