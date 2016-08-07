(function () {
    "use strict";

    angular.module('app.directives')
        .directive('ftFocus', function () {

            return {
                restrict: 'A',
                controller: 'FtFocusController',
                link: function ($scope, $element, $attrs) {
                    //$scope.$watch($attrs.ftFocus, function (newValue, oldValue) {
                    //    if (newValue !== oldValue)
                    //        $element.trigger('focus');
                    //});
                }
            };

        });

})();
