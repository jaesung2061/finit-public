<!DOCTYPE html>
<html lang="en-US">
    <head>
        <meta charset="utf-8">
    </head>
    <body>
        <h2>Password Reset</h2>

        <div>
            To reset your password, complete this form:
            <br>
            <br>
            <a href="{{ URL::to('forgot/password/reset/' . $token) }}">{{ URL::to('forgot/reset/password/' . $token) }}</a>.
            <br>
            <br>
            This link will expire in {{ Config::get('auth.reminder.expire', 60) }} minutes.
        </div>
    </body>
</html>