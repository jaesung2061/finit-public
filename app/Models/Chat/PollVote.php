<?php namespace Finit\Models\Chat;

use App;
use Auth;
use Finit\Helpers;
use Finit\Models\BaseModel;
use Validator;

class PollVote extends BaseModel {
    /**
     * @var array
     */
    protected $fillable = [
        'user_id',
        'poll_id',
        'option'
    ];
    /**
     * @var string
     */
    protected $table = 'poll_votes';
    /**
     * @var array
     */
    public static $validationRules = [
        'poll_id' => 'required|numeric',
        'vote'    => 'required|in:option_1,option_2,option_3,option_4,option_5'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function voter()
    {
        return $this->belongsTo('Finit\Models\User');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function poll()
    {
        return $this->belongsTo('Finit\Models\Chat\Poll');
    }

    /**
     * @param $input
     */
    public static function validate($input)
    {
        $validator = Validator::make($input, [
            'option'  => 'required',
            'poll_id' => 'required|numeric'
        ]);

        if ($validator->fails())
            Helpers::throwValidationException($validator->errors()->toArray());
    }

    /**
     * @param array $attributes
     * @return static
     */
    public static function firstOrCreate(array $attributes = [])
    {
        if (!App::runningInConsole())
            $attributes['user_id'] = Auth::user()->id;

        return parent::create($attributes);
    }
}
