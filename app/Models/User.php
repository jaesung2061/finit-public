<?php namespace Finit\Models;

use Auth;
use Finit\Helpers;
use Finit\Models\Chat\Bot;
use Finit\Models\Chat\Chatroom;
use Finit\Models\Chat\Regular;
use Hash;
use Illuminate\Auth\Authenticatable;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Request;
use Thomaswelton\LaravelGravatar\Facades\Gravatar;
use Validator;

class User extends BaseModel implements AuthenticatableContract, CanResetPasswordContract {

    use Authenticatable, CanResetPassword;

    /**
     * Fillable attributes
     *
     * @var array
     */
    protected $fillable = [
        'facebook_id',
        'email',
        'username',
        'password',
        'dob',
        'gender',
        'location',
        'website',
        'bio',
        'zipcode',
        'picture_lg',
        'picture_md',
        'picture_sm',
        'picture_xs',
        'is_private',
        'is_temp',
        'settings',
        'ip'
    ];
    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'users';
    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = ['password', 'remember_token', 'deleted_at', 'email', 'ip'];
    /**
     * @var array
     */
    protected $appends = ['mod_powers', 'is_bot', 'bans'];
    /**
     * Rules for validation
     *
     * @var array
     */
    public static $validationRules = [
        'email'    => 'email|unique:users,email|max:255',
        'gender'   => 'in:Male,Female',
        'dob'      => 'date|before:-13 years',
        'location' => 'max:64',
        'website'  => 'max:128',
        'password' => 'between:6,255'
    ];
    /**
     * Custom registration error messages
     *
     * @var array
     */
    public static $validationMessages = [
        'email.required'      => 'Your email is not valid.',
        'email.unique'        => 'The email address you provided has already been taken.',
        'email.email'         => 'Your email address is invalid.',
        'username.required'   => 'Please enter a username.',
        'username.alpha_dash' => 'Your username can only contain letters, numbers, underscore and dash.',
        'username.unique'     => 'The username you provided has already been taken.',
        'dob.required'        => 'Please enter your birthday.',
        'gender.required'     => 'Please enter your gender.',
        'dob.date'            => 'Invalid birthday.',
        'dob.before'          => 'Must be 13 years or older.',
        'password.required'   => 'Please enter your password.',
        'password.between'    => 'You\'re password is too short.',
        'password.confirmed'  => 'The passwords do not match.',
        'username.ascii_only' => 'Your username can only contain alphanumeric characters, underscore and dash.',
    ];
    /**
     * @var array
     */
    public static $updateValidationRules = [
        'location' => 'max:64',
        'website'  => 'max:128',
        'bio'      => 'max:255',
        'username' => 'max:20|alpha_num'
    ];
    /**
     * @var array
     */
    public static $updateValidationMessages = [
        'username.max'       => 'Your username can only contain up to 20 characters',
        'username.alpha_num' => 'Your username can only contain alphanumeric characters',
        'username.unique'    => 'That username has been taken',
    ];

    /**
     * Escape html chars for storage and retrieval
     *
     * @param $bio
     */
    public function setBioAttribute($bio)
    {
        $this->attributes['bio'] = htmlspecialchars($bio);
    }

    /**
     * Hash password for storage
     *
     * @param $password
     */
    public function setPasswordAttribute($password)
    {
        $this->attributes['password'] = Hash::make($password);
    }

    /**
     * Escape html chars for storage and retrieval
     *
     * @param $bio
     * @return null | string
     */
    public function getBioAttribute($bio)
    {
        if ($this->is_private && (Auth::user() && !$this->isFriendsWith(Auth::user()) && !$this->isSelf()))
            return $this->attributes['bio'] = null;

        return $bio;
    }

    /**
     * @return mixed
     */
    public function getModPowersAttribute()
    {
        return Moderator::where('user_id', $this->id)->whereApproved(1)->lists('channel');
    }

    /**
     * @return mixed
     */
    public function getBansAttribute()
    {
        return Rule::whereUserId($this->id)->whereType('ban')->lists('channel');
    }

    /**
     * @return bool
     */
    public function getIsBotAttribute()
    {
        return !!Bot::where('user_id', $this->id)->whereApproved(1)->first();
    }

    /**
     * User's chatroom which are favorites)
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function chatroom()
    {
        return $this->hasOne(Chatroom::class, 'owner_id')->where('type', 'public');
    }

    /**
     * @return $this
     */
    public function loadMutes()
    {
        $this->mutedUsers = Mute::whereMuterId($this->id)->lists('muted_id');

        return $this;
    }

    /**
     * Load the user's tags for being a regular
     *
     * @return $this
     */
    public function loadRegularTags()
    {
        $this->regularTags = Regular::whereUserId($this->id)->lists('channel');

        return $this;
    }

    /**
     * User's favorite/saved chatrooms
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function chatrooms()
    {
        return $this->hasMany('Finit\Models\Chat\Chatroom');
    }

    /**
     * Checks to see if there is a friendship link
     * between this user and given user id
     *
     * @param $otherUser
     * @return bool
     */
    public function isFriendsWith($otherUser)
    {
        if (is_object($otherUser))
            $otherUser = $otherUser->id;

        return Friend::areFriends($otherUser, $this->attributes['id']);
    }

    /**
     * Checks to see if given user/userId is
     * $this user
     *
     * @return bool
     */
    public function isSelf()
    {
        return $this->id === Auth::user()->id;
    }

    /**
     * Opposite of isSelf() and is()
     *
     * @param $user
     * @return bool
     */
    public function isNot($user)
    {
        if (gettype($user) == 'object' && get_class($user) == self::class)
        {
            return $this->id != $user->id;
        }
        else if ($user)
        {
            return $this->id != $user;
        }

        return true;
    }

    /**
     * Same as isSelf
     *
     * @param $user
     * @return bool
     */
    public function is($user)
    {
        if (gettype($user) == 'object' && get_class($user) == self::class)
        {
            return $this->id === $user->id;
        }
        else if ($user)
        {
            return $this->id == $user;
        }

        return false;
    }

    /**
     * @param $channel
     * @return bool
     */
    public function isModFor($channel)
    {
        $isModForChannel = !!Moderator::whereChannel($channel)->whereUserId($this->id)->whereApproved(1)->first();
        $isAdmin = $this->is_admin;
        $isJae = $this->id === 1;

        return $isModForChannel || $isAdmin || $isJae;
    }

    /**
     * @param $channel
     * @return bool
     */
    public function isOwnerOf($channel)
    {
        return (Auth::user() && Auth::user()->id === 1) || Chatroom::whereChannel($channel)->value('owner_id') === $this->id;
    }

    /**
     * @param $user
     * @return mixed
     */
    public function hasMuted($user)
    {
        if (gettype($user) == 'object' && get_class($user) == self::class)
        {
            return Mute::whereMutedId($user->id)->whereMuterId($this->id)->first();
        }

        return Mute::whereMutedId($user)->whereMuterId($this->id)->first();
    }

    /**
     * @param $input
     */
    public static function validate($input)
    {
        // For some reason we are receiving the birthday string wrapped in double quotes
        // Too lazy to figure out why so I'm just going to trim them
        if (isset($input['dob'])) $input['dob'] = trim($input['dob'], '"');

        $validator = Validator::make($input, self::$validationRules, self::$validationMessages);

        if ($validator->fails())
            Helpers::throwValidationException($validator->errors()->toArray());
    }

    /**
     * Set default picture based on user gender
     *
     * @param $user
     * @return static
     */
    public static function setDefaultPictures($user)
    {
        if ($user->gender == 'Female')
            $user->picture_lg = $user->picture_md = $user->picture_sm = $user->picture_xs = '/images/avatar-female.jpg';
        else
            $user->picture_lg = $user->picture_md = $user->picture_sm = $user->picture_xs = '/images/avatar-male.jpg';

        return $user;
    }

    /**
     * @param $uri
     * @param $sizeName
     */
    public static function updateProfilePicture($uri, $sizeName)
    {
        self::find(Auth::user()->id)->update([
            'picture_' . $sizeName => env('RACKSPACE_BASE_URL') . $uri
        ]);
    }

    /**
     * Set full name, username attribute before save
     *
     * @param array $attributes
     * @return static
     */
    public static function create(array $attributes = [])
    {
        // todo refactor
        if (!preg_match('/[A-Za-z]/', $attributes['username']))
            Helpers::throwValidationException(['username' => ['Username must contain at least one alphabetical character']]);

        $gravatarStr = isset($attributes['email']) ? $attributes['email'] : $attributes['username'];

        $attributes['picture_lg'] = Gravatar::src($gravatarStr, 512);
        $attributes['picture_md'] = Gravatar::src($gravatarStr, 256);
        $attributes['picture_sm'] = Gravatar::src($gravatarStr, 128);
        $attributes['picture_xs'] = Gravatar::src($gravatarStr, 32);

        $attributes['ip'] = Request::ip();

        return parent::create($attributes);
    }

    /**
     * @param $username
     * @return mixed
     */
    public static function byUsername($username)
    {
        return User::whereUsername($username)->first();
    }

    /**
     * Check if username exists
     *
     * if username already exists, generate new one and return it.
     * else return original
     *
     * @param $username
     * @return string
     */
    public static function checkUsername($username)
    {
        $count = 0;

        // If it exists, generate new one
        // If not, return original
        while (User::where('username', $username)->pluck('username') && $count <= 1000)
        {
            $username = trim(str_replace(range(0, 9), '', $username)) . rand(100, 999);

            // If too many collisions, append more numbers to lower possibilty of collision
            if ($count > 100) $username .= rand(0, 9);
            if ($count > 200) $username .= rand(0, 9);
            if ($count > 300) $username .= rand(0, 9);

            $count++;
        }

        return $username;
    }

    /**
     *
     */
    public static function boot()
    {
        parent::boot();

        static::saving(function ($user)
        {
            //
        });
    }
}
