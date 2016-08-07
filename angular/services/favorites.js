(function () {
    "use strict";

    angular.module('app.services')
        .factory('FavoritesService', function (Restangular, ChatService) {
            var service = this,
                Favorites = Restangular.all('favorites');

            service.favorites = [];

            service.getFavorites = function () {
                return Favorites.getList().then(function (response) {
                    service.favorites = response;

                    return response;
                });
            };
            service.addFavorite = function (chatroom) {
                return Favorites.post({title: chatroom.title});
            };
            service.removeFavorite = function (chatroom) {
                return Restangular.one('favorites', chatroom.channel).remove();
            };
            service.checkIfFavorite = function (chatroom) {
                return Favorites.get(chatroom.channel);
            };
            service.clearData = function () {
                _.remove(service.favorites);
            };

            return service;
        });

})();
