(function () {
    "use strict";

    angular.module('app.directives')
        .directive('ftGlobals', function ($rootScope, WebSocketsService, Helpers) {

            return {
                restrict: 'A',
                link: function ($scope, $element, $attrs) {

                    $(window).on('beforeunload', function () {
                        WebSocketsService.reset();
                    });

                    $(window).on("blur focus", function (e) {
                        var prevType = $(this).data("prevType");

                        if (prevType != e.type) { // reduce double fire issues
                            switch (e.type) {
                                case "blur":
                                    $rootScope.tabFocused = false;
                                    $rootScope.$broadcast('tab-blurred');
                                    break;
                                case "focus":
                                    $rootScope.tabFocused = true;
                                    $rootScope.$broadcast('tab-focused');

                                    var $title = $('#metadata_title').text();

                                    Helpers.updateMetadata({
                                        title: $title.replace(/^\([0-9]+\)/g, '')
                                    });
                                    break;
                            }
                        }

                        $(this).data("prevType", e.type);
                    });
                }
            };

        });

})();
