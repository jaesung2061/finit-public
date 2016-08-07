<?php namespace Finit\Http\Controllers;

use Finit\Models\EmailReset;
use Finit\Models\User;
use Response;

class EmailResetController extends Controller {
    /**
     * Display page for email reset confirmation
     *
     * @param $token
     * @return \Illuminate\View\View
     */
    public function getReset($token)
    {
        $emailReset = EmailReset::where('token', $token)->with('user')->first();

        if (!$emailReset)
        {
            return response()->error('Expired or not found', 404);
        }

        return response()->api($emailReset->toArray());
    }

    /**
     * Reset user's email address
     *
     * @param $token
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function postReset($token)
    {
        $email_reset = EmailReset::where('token', $token)->first();

        if (!$email_reset) return Response::make('Invalid token', 403);

        // if reset was created more than a day ago
        if ((time() - (60 * 60 * 24)) < strtotime($email_reset->created_at) - (60 * 60 * 24))
        {
            $email_reset->delete();

            return Response::make('Email reset has expired', 403);
        }

        $user = User::where('id', $email_reset->user_id)->first();
        $user->email = $email_reset->email_new;
        $user->save();

        $email_reset->delete();

        return Response::make('Email has been reset', 200);
    }
}