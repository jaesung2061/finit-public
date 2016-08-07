<?php namespace Finit\Models;

class Like extends BaseModel {
    /**
     * @var array
     */
	protected $fillable = [
        'box_id',
        'user_id',
        'message_id'
    ];
    /**
     * @var string
     */
    protected $table = 'likes';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function giver()
    {
        return $this->belongsTo('Finit\Models\User');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function taker()
    {
        return $this->belongsTo('Finit\Models\User');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function box()
    {
        return $this->belongsTo('Finit\Models\Box');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function message()
    {
        return $this->belongsTo('Finit\Models\Chat\Message');
    }
}