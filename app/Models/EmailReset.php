<?php namespace Finit\Models;

use Auth;
use Finit\Helpers;
use Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Mail;

class EmailReset extends BaseModel {

    /**
     * @var array
     */
    protected $fillable = [
        'user_id', 'email_current', 'email_new', 'token'
    ];
    /**
     * @var array
     */
    protected $table = 'email_resets';
    /**
     * Validation rules for email reset
     *
     * @var array
     */
    public static $emailResetRules = [
        'email_new'              => 'required|unique:users,email|email',
        'email_new_confirmation' => 'required|same:email_new'
    ];
    /**
     * Validation messages for email reset
     *
     * @var array
     */
    public static $emailResetMessages = [
        'email_new.required'              => 'Email does not match.',
        'email_new.unique'                => 'Email is already being used.',
        'email_new.email'                 => 'Email is not valid.',
        'email_new_confirmation.same'     => 'Email confirmation does not match.',
        'email_new_confirmation.required' => 'Email confirmation is required.',
    ];

    public static function validate($request)
    {

        $v = Validator::make($request->only([
            'email_new',
            'email_new_confirmation',
        ]), self::$emailResetRules, self::$emailResetMessages);

        if ($v->fails())
        {
            $errors = $v->errors()->toArray();

            if (!Hash::check($request->get('password'), Auth::user()->password))
                $errors['password'] = ['Incorrect password.'];

            Helpers::throwValidationException($errors);
        }
    }

    /**
     *
     *
     * @param $input
     */
    public static function sendResetEmail($input)
    {
        $token = Str::random(40);

        static::create([
            'token'     => $token,
            'user_id'   => Auth::user()->id,
            'email_new' => $input['email_new']
        ]);

        Mail::send('emails.reset.email', [
            'token'     => $token,
            'email_new' => $input['email_new']
        ], function ($message)
        {
            $message
                ->to(Auth::user()->email, Auth::user()->username)
                ->subject('Reset your email');
        });
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('Finit\Models\User')->select('id', 'username');
    }
}