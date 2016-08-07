<!DOCTYPE html>
<html lang="en-US">
    <head>
        <meta charset="utf-8">
    </head>
    <body>
        <h2>Email Reset</h2>

        <div>
            To reset your email to {{ $email_new }}, complete this form:
            <br>
            <br>
            <a href="{{ URL::to('reset/email/' . $token) }}">{{ URL::to('reset/email/' . $token) }}</a>.
            <br>
            <br>
            This link will expire in 1 day.
        </div>
    </body>
</html>