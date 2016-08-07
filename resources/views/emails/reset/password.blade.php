<!DOCTYPE html>
<html lang="en-US">
    <head>
        <meta charset="utf-8">
    </head>
    <body>
        <h2>Password Reset</h2>

        <div>
            To reset your password, please complete this form:
            <br>
            <br>
            <a href="{{ URL::to('reset/password/' . $token) }}">{{ URL::to('reset/password/' . $token) }}</a>.
            <br>
            <br>
            This link will expire in 24 hours.
        </div>
    </body>
</html>