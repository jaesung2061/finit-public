<?php namespace Finit\Http\Controllers;

use Dingo\Api\Http\Request;
use Finit\Models\User;
use Illuminate\Support\Facades\Response;
use Input;
use Password;

class RemindersController extends Controller {
    /**
     * Handle a POST request to remind a user of their password.
     *
     * @return Response
     */
    public function postRemind(Request $request)
    {
        $response = Password::sendResetLink($request->only('email'), function ($message)
        {
            $message->subject('Password Reset');
        });

        switch ($response)
        {
            case Password::INVALID_USER:
                return response(['email' => ['Invalid email']], 404);

            case Password::RESET_LINK_SENT:
                return response()->api('Reminder sent', 200);
        }

        return response('Wrong input', 422);
    }

    /**
     * Handle a POST request to reset a user's password.
     *
     * @return Response
     */
    public function postReset(Request $request)
    {
        $credentials = Input::only(
            'email', 'password', 'password_confirmation', 'token'
        );

        $this->validate($request, [
            'password' => 'between:6,255|confirmed'
        ], User::$validationMessages);

        $response = Password::reset($credentials, function ($user, $password)
        {
            $user->password = $password;

            $user->save();
        });

        switch ($response)
        {
            case Password::INVALID_PASSWORD:
                return Response::make('Invalid password', 500);
            case Password::INVALID_TOKEN:
                return Response::make('Invalid token, the reset may have expired.', 500);
            case Password::INVALID_USER:
                return Response::make('Invalid email', 500);
            case Password::PASSWORD_RESET:
                return Response::make('Password has been reset', 200);
        }

        return response()->error('Wrong input');
    }

}
