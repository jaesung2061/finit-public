<?php namespace Finit\Models;

use Carbon\Carbon;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;

class Notification extends BaseModel {
    /**
     * -EVENT-
     * When current user received request
     */
    const FRIEND_REQUEST_RECEIVED = 1; // done
    /**
     * -EVENT-
     * When current user's friend request to
     * other user was accepted by other user
     */
    const FRIEND_REQUEST_ACCEPTED = 2; // done
    /**
     * -EVENT-
     * When current user received invite
     * to one on one chat
     */
    const CHAT_INVITE_PRIVATE_RECEIVED = 3;
    /**
     * -EVENT-
     * When current user received invite
     * to protected chatroom
     */
    const CHAT_INVITE_PROTECTED_RECEIVED = 4;
    /**
     * -EVENT-
     * When current user received invite
     * to public chatroom
     */
    const CHAT_INVITE_PUBLIC_RECEIVED = 5;
    /**
     * -EVENT-
     * When current user received box
     * from other user for profile wall
     */
    const BOX_RECEIVED = 6;
    /**
     * -EVENT-
     * When current user receives comment for box
     */
    const BOX_COMMENT_RECEIVED = 7;
    /**
     * -EVENT-
     * When box is liked
     */
    const BOX_LIKED = 8;
    /**
     * -EVENT-
     * When chat message is liked
     */
    const CHAT_MESSAGE_LIKED = 9;
    /**
     * -EVENT-
     * When message is sent to private channel
     * and receiver is not logged in
     */
    const PRIVATE_MESSAGE_RECEIVED = 10;
    /**
     * -EVENT-
     * When user is banned from channel
     */
    const BANNED_FROM_CHANNEL = 11;
    /**
     * -EVENT-
     * When user is unbanned from channel
     */
    const UNBANNED_FROM_CHANNEL = 12;
    /**
     * -EVENT-
     * When user is promoted to mod for channel
     */
    const PROMOTED_TO_MOD = 13;
    /**
     * -EVENT-
     * When user is demoted as mod for channel
     */
    const DEMOTED_AS_MOD = 14;

    /**
     * @var array
     */
    protected $fillable = ['user_id', 'source_id', 'invite_id', 'event', 'data', 'is_read'];
    /**
     * @var string
     */
    protected $table = 'notifications';
    /**
     * @var array
     */
    protected $appends = ['event_info', 'time_ago'];

    /**
     * Based on event, generate string for more information.
     * This is not stored in DB because user's name may change
     *
     * @return string
     */
    public function getEventInfoAttribute()
    {
        if (!$this->source)
        {
            return $this->eventInfo = '[Deleted] has sent you a message.';
        }

        $otherUser = $this->source->username;
        $data = null;

        try
        {
            $data = json_decode($this->data);
        }
        catch (\Exception $e)
        {
            //
        }

        switch ($this->event):
            case self::FRIEND_REQUEST_RECEIVED:
                return $this->eventInfo = $otherUser . ' has sent you a friend request.';
            case self::FRIEND_REQUEST_ACCEPTED:
                return $this->eventInfo = $otherUser . ' has accepted your friend request.';
            case self::CHAT_INVITE_PRIVATE_RECEIVED:
                return $this->eventInfo = $otherUser . ' wants to chat with you.';
            case self::CHAT_INVITE_PROTECTED_RECEIVED:
                return $this->eventInfo = $otherUser . ' invited you to a chatroom.';
            case self::CHAT_INVITE_PUBLIC_RECEIVED:
                return $this->eventInfo = $otherUser . ' invited you to ' . json_decode($this->data)->chatroom_title . '.';
            case self::BOX_RECEIVED:
                return $this->eventInfo = $otherUser . ' dropped you a box.';
            case self::BOX_COMMENT_RECEIVED:
                return $this->eventInfo = $otherUser . ' commented on your a box.';
            case self::BOX_LIKED:
                return $this->eventInfo = $otherUser . ' likes a box on your wall.';
            case self::CHAT_MESSAGE_LIKED:
                return $this->eventInfo = $otherUser . ' likes your message.';
            case self::PRIVATE_MESSAGE_RECEIVED:
                return $this->eventInfo = $otherUser . ' sent you a message.';
            case self::BANNED_FROM_CHANNEL:
                if (isset($data))
                    return $this->eventInfo = 'You have been banned from ' . $this->getChatroomTitle($data->chatroom->channel) . '.';

                return $this->eventInfo = 'You have been banned from a channel.';
            case self::UNBANNED_FROM_CHANNEL:
                if (isset($data))
                    return $this->eventInfo = 'You have been unbanned from ' . $this->getChatroomTitle($data->chatroom->channel) . '.';

                return $this->eventInfo = 'You have been unbanned from a channel.';
            case self::PROMOTED_TO_MOD:
                if (isset($data))
                    return $this->eventInfo = 'You have been promoted to moderator for ' . $this->getChatroomTitle($data->chatroom->channel) . '. Please refresh your browser for your powers to work.';

                return $this->eventInfo = 'You have been promoted to moderator. Please refresh your browser for your powers to work.';
            case self::DEMOTED_AS_MOD:
                if (isset($data) && isset($data->chatroom) && isset($data->chatroom->channel))
                    return $this->eventInfo = 'You have been demoted from moderator position for ' . $this->getChatroomTitle($data->chatroom->channel) . '.';

                return $this->eventInfo = 'You have been demoted from moderator position.';
        endswitch;

        return $this->eventInfo;
    }

    /**
     * @return string
     */
    public function getTimeAgoAttribute()
    {
        $carbon = new Carbon($this->attributes['created_at']);

        return $this->attributes['timeAgo'] = $carbon->diffForHumans();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('Finit\Models\User');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function source()
    {
        return $this->belongsTo('Finit\Models\User')->select(['id', 'username', 'picture_xs']);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function invite()
    {
        return $this->hasOne(Invite::class);
    }

    /**
     * @param $channel
     * @return string
     */
    private function getChatroomTitle($channel)
    {
        return '#' . substr($channel, 4);
    }

    /**
     * @param $usersToNotify
     * @param $event
     * @param $data
     * @param bool $persist
     * @return Notification
     */
    public static function notify($usersToNotify, $event, $data = [], $persist = true)
    {
        if (!is_array($usersToNotify))
            $usersToNotify = [$usersToNotify];

        foreach ($usersToNotify as $userToNotify)
        {
            $user_id = is_object($userToNotify) ? $userToNotify->id : $userToNotify;

            $attributes = [
                'user_id'   => (int)$user_id,
                'event'     => $event,
                'data'      => $data,
                'source_id' => Auth::user() ? Auth::user()->id : (int)$data['source_id']
            ];

            if ($persist)
                $notification = static::create($attributes);
            else
                $notification = new self($attributes);

            $notification->load('source');

            App::make('Finit\WebSockets')->notify($notification);
        }
    }

    /**
     * @param array $attributes
     * @return static
     * @throws \Exception
     */
    public static function create(array $attributes = [])
    {
        $eventIsChatInvite = $attributes['event'] == Notification::CHAT_INVITE_PRIVATE_RECEIVED || $attributes['event'] == Notification::CHAT_INVITE_PROTECTED_RECEIVED || $attributes['event'] == Notification::CHAT_INVITE_PUBLIC_RECEIVED;

        // If the notification was invitation, we don't want duplicates
        if ($eventIsChatInvite)
        {
            $old = Notification::where('user_id', $attributes['user_id'])->where('event', $attributes['event'])->first();
            if ($old)
            {
                $old->delete();
            }
        }

        if (isset($attributes['data']))
        {
            $attributes['data'] = json_encode($attributes['data']);
        }

        return parent::create($attributes);
    }
}
