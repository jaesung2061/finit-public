<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Stripe, Mailgun, Mandrill, and others. This file provides a sane
    | default location for this type of information, allowing packages
    | to have a conventional place to find your various credentials.
    |
    */

    'mailgun' => [
        'domain' => '',
        'secret' => '',
    ],

    'mandrill' => [
        'secret' => env('MAIL_KEY'),
    ],

    'ses' => [
        'key' => env('MAIL_KEY'),
        'secret' => ENV('SES_SECRET'),
        'region' => 'us-west-2',
    ],

    'stripe' => [
        'model'  => 'Finit\Model\User',
        'secret' => '',
    ],

    'facebook' => [
        'client_id'     => env('FACEBOOK_APP_ID'),
        'client_secret' => env('FACEBOOK_SECRET'),
        'redirect'      => 'http://finit.app:8000/api/facebook/handle'
    ],

];
