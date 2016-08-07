<?php namespace Finit\Models\Chat;

use Finit\Models\BaseModel;

/**
 * Favorite chatrooms
 *
 * Class Chatroom
 * @package Finit\Models\Chat
 */
class Favorite extends BaseModel {
    /**
     * @var array
     */
    protected $fillable = [
        'user_id',
        'suffix',
        'title',
        'channel'
    ];
    /**
     * @var string
     */
    protected $table = 'favorites';

    /**
     * @param $channel
     */
    public function setChannelAttribute($channel)
    {
        $this->attributes['channel'] = strtolower($channel);
    }

    /**
     * @param $suffix
     */
    public function setSuffixAttribute($suffix)
    {
        $this->attributes['suffix'] = strtolower($suffix);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('Finit\Models\User');
    }
}