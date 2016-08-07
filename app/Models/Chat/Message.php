<?php namespace Finit\Models\Chat;

use Auth;
use Finit\Models\BaseModel;
use Finit\Models\Like;
use Finit\Models\Photo;

class Message extends BaseModel {
    /**
     * @var array
     */
    protected $fillable = [
        'body',
        'sender_id',
        'channel'
    ];
    /**
     * @var string
     */
    protected $table = 'chat_messages';
    /**
     * @var array
     */
    protected $appends = ['isLikedByCurrentUser', 'starsCount'];

    /**
     * @return $this|bool
     */
    public function getIsLikedByCurrentUserAttribute()
    {
        if (Auth::user()) {
            return $this->attributes['isLikedByCurrentUser'] = Like::where('message_id', $this->attributes['id'])->where('user_id', Auth::user()->id)->first();
        }

        return $this->attributes['isLikedByCurrentUser'] = false;
    }

    /**
     * @return int
     */
    public function getStarsCountAttribute()
    {
        return $this->attributes['starsCount'] = Like::where('message_id', $this->attributes['id'])->count();
    }

    /**
     * @return mixed
     */
    public function sender()
    {
        return $this->belongsTo('Finit\Models\User')->select(['id', 'username', 'picture_xs']);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function photo()
    {
        return $this->hasOne(Photo::class);
    }

    /**
     * @param array $attributes
     * @return static
     */
    public static function create(array $attributes = [])
    {
        if (strlen(utf8_decode($attributes['body'])) > 255) {
            $attributes['body'] = substr(utf8_decode($attributes['body']), 0, 255);
        }

        return parent::create($attributes);
    }
}