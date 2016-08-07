(function () {
    "use strict";

    angular.module("app.services")
        .factory('ToastService', function ($mdToast) {
            var delay = 4000,
                position = 'bottom right',
                action = 'OK';

            return {
                show: function (content, action_, delay_, parent) {
                    if (!content) {
                        return false;
                    }

                    var toast = $mdToast.simple()
                        .content(content)
                        .position(position)
                        .theme('primary')
                        .action(action_ || action)
                        .hideDelay(delay_ || delay);

                    if (parent) {
                        console.log(parent);
                        toast.parent(parent);
                    }

                    return $mdToast.show(toast);
                },
                error: function (content) {
                    if (!content) {
                        return false;
                    }

                    return $mdToast.show(
                        $mdToast.simple()
                            .content(content)
                            .position(position)
                            .theme('warn')
                            .action(action)
                            .hideDelay(delay)
                    );
                },
                fromTemplate: function (template, $scope, options) {
                    options = options || {};
                    options.templateUrl = './views/toasts/' + template + '/' + template + '.html';
                    options.controller = camelCase(template + 'ToastController').capitalizeFirstLetter();
                    options.delay = options.delay || delay;
                    options.position = options.position || position;
                    options.action = options.action || action;

                    if ($scope) {
                        options.scope = $scope.$new();
                    }

                    return $mdToast.show(options);
                }
            };
        });

})();
