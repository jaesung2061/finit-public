<?php namespace Finit\Models;

use Finit\Helpers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Mail;

class PasswordReset extends BaseModel {

    /**
     * @var array
     */
    protected $fillable = [
        'user_id', 'password_current', 'password_new', 'token'
    ];
    /**
     * @var array
     */
    protected $table = 'password_resets';
    /**
     * Validation rules for password reset
     *
     * @var array
     */
    public static $passwordResetRules = [
        'password_new'          => 'required|between:6,255',
        'password_new_confirmation' => 'required|same:password_new'
    ];
    /**
     * Validation messages for password reset
     *
     * @var array
     */
    public static $passwordResetMessages = [
        'password_new.required'              => 'Password does not match.',
        'password_new.unique'                => 'Password is already being used.',
        'password_new_confirmation.same'     => 'Password confirmation does not match.',
        'password_new_confirmation.required' => 'Password confirmation is required.',
    ];

    public static function validate($request)
    {
        $v = Validator::make($request->only([
            'password_new', 'password_new_confirmation',
        ]), self::$passwordResetRules, self::$passwordResetMessages);

        if (!Hash::check($request->get('password_current'), Auth::user()->password))
            Helpers::throwValidationException(['password' => ['The password you entered does not match the one on record']]);

        if ($v->fails())
        {
            Helpers::throwValidationException($v->errors()->toArray());
        }
    }

    /**
     * Create new password reset model
     * Send out email
     *
     * @param $input
     */
    public static function sendResetEmail($input)
    {
        $token = Str::random(40);

        PasswordReset::create([
            'token'        => $token,
            'user_id'      => Auth::user()->id,
            'password_new' => $input['password_new']
        ]);

        Mail::send('emails.reset.password', ['token' => $token], function ($message)
        {
            $message->to(\Auth::user()->email, \Auth::user()->username)
                ->subject('Reset your password');
        });
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('Finit\Models\User')->select('id', 'username', 'email');
    }
}