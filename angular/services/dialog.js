(function () {
    "use strict";

    angular.module("app.services")
        .factory('DialogService', function ($mdDialog, $mdMedia) {

            return {
                fromTemplate: function (template, $scope, options) {

                    var defaults = {
                        templateUrl: './views/dialogs/' + template + '/' + template + '.html?' + Finit.version,
                        fullScreen: $mdMedia('sm'),
                        controller: camelCase(template + 'DialogController').capitalizeFirstLetter(),
                        clickOutsideToClose: true
                    };

                    options = angular.element.extend(defaults, options);

                    if ($scope) {
                        options.scope = $scope.$new();
                    }

                    return $mdDialog.show(options);
                },

                hide: function () {
                    return $mdDialog.hide();
                },

                alert: function (title, content) {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .title(title)
                            .content(content)
                            .ok('Ok')
                    );
                },

                confirm: function (title, content) {
                    return $mdDialog.show(
                        $mdDialog.confirm()
                            .title(title)
                            .content(content)
                            .ok('Ok')
                            .cancel('Cancel')
                    );
                }
            };
        });
})();