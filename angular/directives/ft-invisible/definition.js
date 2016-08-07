(function () {
    "use strict";

    angular.module('app.directives')
        .directive('ftInvisible', function () {

            return {
                restrict: 'A',
                link: function ($scope, $element, $attrs) {
                    var value = $scope.$eval($attrs.ftInvisible);

                    if (!!value)
                        $element.css('visibility', 'hidden');
                    else
                        $element.css('visibility', 'visible');

                    $scope.$watch($attrs.ftInvisible, function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            if (!!newValue)
                                $element.css('visibility', 'hidden');
                            else
                                $element.css('visibility', 'visible');
                        }
                    });
                }
            };

        });

})();
