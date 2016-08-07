(function () {
    "use strict";

    angular.module('app.routes')
        .run(function ($rootScope, $mdSidenav, $state, $stateParams, AuthService, EVENTS, Session, Helpers) {
            FastClick.attach(document.body);

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
                if (Session.authRequestComplete && !Session.isAuthenticated() && toState.data.authorization === 'auth') {
                    if (toState.name === 'app.chat.show') {
                        $rootScope.openDialog('accounts', {
                            locals: {channel: toParams.title}
                        });
                    }
                    event.preventDefault();
                } else if (Session.authRequestComplete && Session.isAuthenticated() && toState.data.authorization === 'guests') {
                    event.preventDefault();
                }
            });
            $rootScope.$on('$stateChangeSuccess', function (event, toState) {
                $mdSidenav('left').close();
                if (!$state.is('app.chat.show')) {
                    Helpers.updateMetadata($state.current.data.metadata);
                }
            });
        });

})();
