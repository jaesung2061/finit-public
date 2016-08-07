<?php

Route::get('/unsupported-browser', 'AngularController@unsupported');

$api = app(Dingo\Api\Routing\Router::class);

$api->version('v1', function ($api)
{
    // Auth
    $api->post('auth', 'Finit\Http\Controllers\AuthenticateController@login');
    $api->get('auth', 'Finit\Http\Controllers\AuthenticateController@verifyToken');
    $api->delete('auth', 'Finit\Http\Controllers\AuthenticateController@destroy');

    // Users
    $api->post('users/temp', 'Finit\Http\Controllers\UsersController@createTempAccount');
    $api->post('users/unsubscribe', 'Finit\Http\Controllers\UsersController@unsubscribeFromEmails');
    $api->post('users/photo', 'Finit\Http\Controllers\UsersController@photo');
    $api->resource('users', 'Finit\Http\Controllers\UsersController');

    // Friends
    $api->get('friends/{id}/mutual', 'Finit\Http\Controllers\FriendsController@mutual');
    $api->get('friends/requests', 'Finit\Http\Controllers\FriendsController@requests');
    $api->resource('friends', 'Finit\Http\Controllers\FriendsController');

    // Notifications
    $api->resource('notifications', 'Finit\Http\Controllers\NotificationsController');

    // Chat
    $api->post('chatrooms/photo', 'Finit\Http\Controllers\ChatroomsController@photo');
    $api->resource('chatrooms', 'Finit\Http\Controllers\ChatroomsController');

    // Chat messages
    $api->group(['middleware' => 'api.throttle', 'limit' => 5, 'expires' => 1], function ($api)
    {
        $api->post('messages/photo', 'Finit\Http\Controllers\MessagesController@photo');
    });
    $api->resource('messages', 'Finit\Http\Controllers\MessagesController');

    // Favorites
    $api->resource('favorites', 'Finit\Http\Controllers\FavoritesController');

    // Invites
    $api->resource('invites', 'Finit\Http\Controllers\InvitesController');

    // Polls
    $api->post('polls/{id}/vote', 'Finit\Http\Controllers\PollsController@submitVote');
    $api->resource('polls', 'Finit\Http\Controllers\PollsController');

    // Rules (bans on chatrooms etc)
    $api->resource('rules', 'Finit\Http\Controllers\RulesController');

    // Regulars (users tagged as a regular for channels)
    $api->resource('regulars', 'Finit\Http\Controllers\RegularsController');

    // Boxes
    $api->post('boxes/photo', 'Finit\Http\Controllers\BoxesController@photo');
    $api->resource('boxes', 'Finit\Http\Controllers\BoxesController');

    // Likes
    $api->resource('likes', 'Finit\Http\Controllers\LikesController');

    // Likes
    $api->resource('moderators', 'Finit\Http\Controllers\ModeratorsController');

    // Bug Reports
    $api->resource('bug-reports', 'Finit\Http\Controllers\BugReportsController');

    // Mutes
    $api->resource('mutes', 'Finit\Http\Controllers\MutesController');

    // WebSockets
    $api->post('websockets/notify', 'Finit\Http\Controllers\WebSocketsController@notify');
    $api->post('websockets/auth', 'Finit\Http\Controllers\WebSocketsController@authenticate');
    $api->get('websockets/channels', 'Finit\Http\Controllers\WebSocketsController@getChannels');
    $api->post('websockets/send', 'Finit\Http\Controllers\WebSocketsController@trigger');

    // Password reminder (forgot password)
    $api->post('forgot/password/remind', 'Finit\Http\Controllers\RemindersController@postRemind');
    $api->post('forgot/password/reset', 'Finit\Http\Controllers\RemindersController@postReset');

    // Reset email/password
    $api->group(['prefix' => 'reset'], function ($api)
    {
        $api->get('email/{token}', 'Finit\Http\Controllers\EmailResetController@getReset');
        $api->post('email/{token}', 'Finit\Http\Controllers\EmailResetController@postReset');

        $api->get('password/{token}', 'Finit\Http\Controllers\PasswordResetController@getReset');
        $api->post('password/{token}', 'Finit\Http\Controllers\PasswordResetController@postReset');
    });

    // Contact
    $api->post('contact', 'Finit\Http\Controllers\ContactController@contact');

    // Commands
    $api->post('commands/execute', 'Finit\Http\Controllers\CommandsController@execute');

    // For site map data
    $api->get('site-map', 'Finit\Http\Controllers\AngularController@siteMapData');
    $api->get('site-map.xml', 'Finit\Http\Controllers\AngularController@siteMapXml');

    // Ping test
    $api->get('pingtest', 'Finit\Http\Controllers\AngularController@pingTest');
});

Route::get('{slug}', 'AngularController@serveApp')->where('slug', '((?!(_debugbar/|livereload.js)).*)');
