<?php namespace Finit\Models\Chat;

use Finit\Models\BaseModel;
use Finit\Models\User;

class Regular extends BaseModel {
    protected $fillable = ['user_id', 'channel'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}