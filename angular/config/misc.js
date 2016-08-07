(function () {
    "use strict";

    angular.module('app.config')
        .config(function (WebSocketsServiceProvider) {
            WebSocketsServiceProvider.setOptions({
                authPath: '/api/websockets/auth',
                instance_id: Finit.instance_id
            });
            lightbox.option({
                'wrapAround': true
            });
            //FacebookProvider.init(window.Finit.app_keys.facebook);
        });

})();
