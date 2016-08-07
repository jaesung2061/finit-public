<?php namespace Finit\Models;

class Moderator extends BaseModel {
    /**
     * @var array
     */
    protected $fillable = ['user_id', 'channel'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('Finit\Models\User');
    }
}
