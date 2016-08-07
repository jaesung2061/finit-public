<?php namespace Finit\Models;

class Mute extends BaseModel {
    /**
     * @var array
     */
    protected $fillable = ['muted_id', 'muter_id'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function muted()
    {
        return $this->hasOne(User::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function muter()
    {
        return $this->hasOne(User::class);
    }
}
