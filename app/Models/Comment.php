<?php namespace Finit\Models;

use Finit\Helpers;
use Validator;

class Comment extends BaseModel {
    /**
     * @var string
     */
    protected $table = 'comments';
    /**
     * @var array
     */
    protected $fillable = [
        'blog_id',
        'box_id',
        'picture_id',
        'giver_id',
        'taker_id',
        'body'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function giver()
    {
        return $this->belongsTo('Finit\Models\User')->select(['id', 'username', 'picture_xs', 'picture_md']);
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
     * @param $input
     */
    public static function validate($input)
    {
        $v = Validator::make($input, [
            'body' => 'required|max:50'
        ]);

        if ($v->fails()) {
            Helpers::throwValidationException($v->errors()->toArray());
        }
    }
}