<?php namespace Finit\Models\Chat;

use Auth;
use Finit\Helpers;
use Finit\Models\Invite;
use Finit\Models\Moderator;
use Finit\Models\User;
use Illuminate\Database\Eloquent\Model;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class Chatroom extends Model {
    /**
     * @var array
     */
    protected $fillable = [
        'channel',
        'tab_title',
        'description_short',
        'description',
        'image',
        'settings',
        'title',
        'type'
    ];
    /**
     * @var array
     */
    protected $appends = ['title'];
    /**
     * @var array
     */
    public static $modes = ['mods', 'regulars', 'registered', 'all'];

    /**
     * @return string
     */
    public function getTitleAttribute()
    {
        if (starts_with($this->attributes['channel'], 'pub_')) {
            return $this->attributes['title'] = substr($this->attributes['channel'], 4);
        }
        else if (!isset($this->attributes['title']))
        {
            return $this->attributes['title'] = substr($this->attributes['channel'], 4);
        }

        return $this->attributes['title'];
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function mods()
    {
        return $this->hasMany(Moderator::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function invites()
    {
        return $this->hasMany(Invite::class, 'channel', 'channel');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function owner()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @param $user
     * @return bool
     */
    public function ownerIs(User $user)
    {
        return $this->owner_id === $user->id || Auth::user()->id === $user->id;
    }

    /**
     * @param $mode
     * @return $this
     */
    public function setMode($mode)
    {
        if ($this->settings)
            $settings = json_decode($this->settings, true);
        else
            $settings = [];

        $settings['mode'] = $mode;

        $this->settings = $settings;

        $this->save();

        return $this;
    }

    /**
     * @param $channel
     * @return mixed
     */
    public static function firstByChannel($channel)
    {
        return static::whereChannel('channel')->first();
    }

    /**
     * @param $request
     * @return string
     */
    public static function firstOrCreatePrivate($request)
    {
        return '';
    }

    /**
     * @param $request
     * @return static
     */
    public static function firstOrCreatePublic($request)
    {
        if (!Auth::user()->isModFor($request->get('channel')) && Auth::user()->id !== 1)
            throw new AccessDeniedHttpException;

        $chatroom = Chatroom::firstOrCreate(['channel' => $request->get('channel')]);

        $chatroom->update($request->only(['description_short', 'description', 'tab_title']));

        return $chatroom;
    }

    /**
     * @param $request
     * @return static
     */
    public static function firstOrCreateProtected($request)
    {
        $channel = Chatroom::generateProtectedChatroomName(Auth::user()->id, $request->get('channel'));

        $chatroom = Chatroom::firstOrCreate([
            'channel'  => $channel,
            'owner_id' => Auth::user()->id,
            'title'    => $request->get('title')
        ]);

        $chatroom->settings = [
            'auth'              => $request->get('auth'),
            'invitePermissions' => $request->get('invitePermissions')
        ];

        $chatroom->owner_id = Auth::user()->id;

        $chatroom->save();

        return $chatroom;
    }

    /**
     * @param $request
     */
    public static function validateProtectedChatroom($request)
    {
        $errors = [];
        $auth = $request->get('auth');
        $title = $request->get('title');
        $invitePermissions = $request->get('invitePermissions');

        if (!$title)
        {
            $errors['title'] = ['Please enter a title.'];
        }

        if (!$auth || count($auth) === 0 || (!array_has($auth, 'anyone') && !array_has($auth, 'friends') && !array_has($auth, 'friends-of-friends') && !array_has($auth, 'invite')))
        {
            $errors['auth'] = ['Please select who can join.'];
        }
        else if (array_has($auth, 'friends-of-friends') && !array_has($auth, 'friends'))
        {
            $errors['auth'] = ['Friends must be allowed to allow their friends to join.'];
        }
        else if (array_has($auth, 'invite') && $auth['invite'] == true && !$request->get('invitePermissions'))
        {
            $errors['auth'] = ['Please specify who can send out invites.'];
        }

        if ($invitePermissions && !in_array($invitePermissions, ['owner', 'friends', 'friends-of-friends', 'anyone']))
        {
            $errors['invites'] = ['Invalid input.'];
        }

        if (count($errors) > 0)
        {
            Helpers::throwValidationException($errors);
        }
    }

    /**
     * @param $userId
     * @param $title
     * @return string
     */
    public static function generateProtectedChatroomName($userId, $title)
    {
        return 'pro_' . md5($userId . $title . time());
    }

    /**
     *
     */
    public static function boot()
    {
        parent::boot();

        static::saving(function ($chatroom)
        {
            if (!is_string($chatroom->settings))
            {
                $chatroom->settings = json_encode($chatroom->settings);
            }

            if (starts_with($chatroom->channel, 'pub_'))
            {
                $chatroom->type = 'public';
            }
            else if (starts_with($chatroom->channel, 'pro_'))
            {
                $chatroom->type = 'protected';
            }
            else if (starts_with($chatroom->channel, 'prv_'))
            {
                $chatroom->type = 'private';
            }
        });
    }
}
