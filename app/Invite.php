<?php namespace Finit\Models;

use Finit\Models\User;
use Illuminate\Database\Eloquent\Model;

class Invite extends Model {
    /**
     * @var array
     */
    protected $fillable = ['requester_id', 'accepter_id', 'channel', 'data', 'message'];

    /**
     * @param $data
     */
    public function setDataAttribute($data)
    {
        $this->data = json_encode($data);
    }

    /**
     * @param $data
     * @return mixed
     */
    public function getDataAttribute($data)
    {
        return $this->data = json_decode($data);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function requester()
    {
        return $this->belongsTo(User::class)->select(['id', 'username', 'picture_xs']);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function accepter()
    {
        return $this->belongsTo(User::class)->select(['id', 'username', 'picture_xs']);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function notification()
    {
        return $this->belongsTo(Notification::class);
    }
}
