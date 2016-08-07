<?php namespace Finit\Models;

class Rule extends BaseModel {
    /**
     * @var array
     */
    protected $fillable = ['user_id', 'source_id', 'channel', 'type'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function source()
    {
        return $this->belongsTo(User::class);
    }
}
