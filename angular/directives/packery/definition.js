(function () {
    "use strict";

    angular.module('app.directives')
        .directive('packery', function (EVENTS, $timeout) {
            var packeryOptions = {
                itemSelector: '.wall-box',
                layoutMode: 'packery',
                packery: {gutter: 10}
            };

            /**
             * This function sets packery container width to
             * specified widths depending on browser width.
             *
             * @param $element
             */
            function setWidth($element) {
                var containerWidth = $element.closest('.profile-wall-container').width();
                var columnWidth = 209;

                if (containerWidth === columnWidth * 4 + 30) {
                    // full width 4 col
                    $element.width('100%');
                } else if (containerWidth < columnWidth * 4 + 30 && containerWidth >= columnWidth * 3 + 20) {
                    // 3 col
                    $element.width(columnWidth * 3 + 20);
                } else if (containerWidth < columnWidth * 3 + 20 && containerWidth >= columnWidth * 2 + 10) {
                    // 2 col
                    $element.width(columnWidth * 2 + 10);
                } else {
                    $element.width('100%');
                }
            }

            /**
             * This is just to test the md-colors. Creates elements
             * for profile wall in all colors and hues. Won't be
             * using this in production
             *
             * @param $packery
             */
            function createElements($packery) {
                var colors = [
                    'red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal', 'green',
                    'light-green', 'lime', 'yellow', 'amber', 'orange', 'deep-orange', 'brown', 'grey', 'blue-grey'
                ];
                var content = 'Waterboarding at Guantanamo Bay sounds super rad if you don\'t know what either of those things are.';
                var $newBox, i, index;

                for (i = 0; i < colors.length; i++) {
                    $newBox = angular.element('<div class="wall-box hover md-color ' + colors[i] + ' hue-50">');
                    $newBox.html('<span>' + colors[i] + ' ' + content + '</span>');
                    $packery.append($newBox);

                    for (index = 1; index < 9; index++) {
                        $newBox = angular.element('<div class="wall-box hover md-color ' + colors[i] + ' hue-' + (index * 100) + '">');
                        $newBox.text(colors[i] + ' ' + content);
                        $packery.append($newBox);
                    }
                }

                for (i = 0; i < colors.length; i++) {
                    var hues = ['hue-A100', 'hue-A200', 'hue-A400', 'hue-A700'];

                    for (var i2 = 0; i2 < hues.length; i2++) {
                        $newBox = angular.element('<div class="wall-box hover md-color ' + colors[i] + ' ' + hues[i2] + '">');
                        $newBox.text(content);
                        $packery.append($newBox);
                    }
                }

                angular.element('.wall-box').css('padding', 10);
            }

            return {
                restrict: 'EA',
                controller: 'PackeryController',
                template: '<div ng-transclude style="margin:0 auto;max-width:100%;"></div>',
                transclude: true,
                link: function ($scope, $element, $attrs) {
                    var $packery = $element.children('[ng-transclude]');
                    var $pager = $element.siblings('pager');

                    $packery.isotope(packeryOptions);
                    setWidth($packery);
                    setWidth($pager);

                    angular.element(window).resize(function () {
                        setWidth($packery);
                        setWidth($pager);
                    });

                    $scope.$on(EVENTS.boxes.received, function () {
                        $timeout(function () {
                            $packery.isotope('prepended', $packery.children('.wall-box'));
                            $scope.requestingBoxes = false;
                        }, 250);
                    });
                    $scope.$on(EVENTS.boxes.requesting, function () {
                        $packery.isotope('remove', $packery.children('.wall-box'));
                    });
                    $scope.$on(EVENTS.boxes.added, function (event, boxId) {
                        $timeout(function () {
                            var $box = $packery.children('[data-box-id="' + boxId + '"]');
                            $packery.isotope('prepended', $box);
                        }, 200);
                    });
                    $scope.$on(EVENTS.boxes.removed, function () {
                        $timeout(function () {
                            $packery.isotope('layout');
                        }, 108);
                    });
                }
            };
        });
})();
