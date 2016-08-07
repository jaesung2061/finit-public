<?php namespace Finit\Http\Controllers;

use Finit\Models\PasswordReset;
use Finit\Models\User;
use Response;

class PasswordResetController extends Controller {
    /**
     * Display page for password reset confirmation
     *
     * @param $token
     * @return \Illuminate\View\View
     */
    public function getReset($token)
    {
        $passwordReset = PasswordReset::where('token', $token)->select(['id', 'token', 'user_id'])->with('user')->first();

        if (!$passwordReset)
        {
            return response('Expired or not found', 404);
        }

        return response()->api($passwordReset);
    }

    /**
     * Reset user's password
     *
     * @param $token
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function postReset($token)
    {
        $passwordReset = PasswordReset::where('token', $token)->first();

        if (!$passwordReset) return Response::make(['error' => ['Invalid token or reset expired']], 403);

        // if reset was created more than an hour ago
        if ((time() - (60 * 60)) < strtotime($passwordReset->created_at) - (60 * 60))
        {
            $passwordReset->delete();

            return Response::make(['error' => ['Password reset has expired']], 403);
        }

        $user = User::where('id', $passwordReset->user_id)->first();
        $user->password = $passwordReset->password_new;
        $user->save();

        $passwordReset->delete();

        return Response::make('Password has been reset', 200);
    }
}