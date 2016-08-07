<?php namespace Finit\Models;

use Auth;
use Carbon\Carbon;

class Friend extends BaseModel {
    /**
     * Fillable attributes
     *
     * @var array
     */
    protected $fillable = ['requester_id', 'accepter_id', 'status'];
    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'friends';
    /**
     * @var array
     */
    protected $appends = ['time_ago'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function requester()
    {
        return $this->belongsTo('Finit\Models\User');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function accepter()
    {
        return $this->belongsTo('Finit\Models\User');
    }

    /**
     * Set time ago attribute
     *
     * @return mixed
     */
    public function getTimeAgoAttribute()
    {
        return $this->attributes['timeAgo'] = (new Carbon($this->updated_at))->diffForHumans();
    }

    /**
     * Check if two users are friends by Id
     *
     * @param $userA
     * @param $userB
     * @return bool
     */
    public static function areFriends($userA, $userB)
    {
        $first = Friend::where('accepter_id', '=', $userA)->where('requester_id', $userB)->pluck('id');
        if ($first) return true;

        $second = Friend::where('accepter_id', $userB)->where('requester_id', '=', $userA)->pluck('id');
        if ($second) return true;

        return false;
    }

    /**
     * @param $id
     * @return mixed
     */
    public static function whereRequester($id)
    {
        return static::whereRequesterId($id)->whereAccepterId(Auth::user()->id)->first();
    }

    /**
     * @param $id
     * @return mixed
     */
    public static function whereAccepter($id)
    {
        return static::whereAccepterId($id)->whereRequesterId(Auth::user()->id)->first();
    }
}