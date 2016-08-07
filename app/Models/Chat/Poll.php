<?php namespace Finit\Models\Chat;

use App;
use Auth;
use Carbon\Carbon;
use Finit\Helpers;
use Finit\Models\BaseModel;
use Validator;

class Poll extends BaseModel {
    /**
     * @var array
     */
    protected $fillable = [
        'user_id',
        'chatroom_channel',
        'question',
        'options'
    ];
    /**
     * @var string
     */
    protected $table = 'polls';
    /**
     * @var array
     */
    public static $validationRules = [
        'question'         => 'required|max:50',
        'options'          => 'required'
    ];
    /**
     * @var array
     */
    protected $appends = ['votes', 'userHasVoted', 'options1'];

    /**
     * Restangular on the front-end overrides options property, so we will
     * use options1 as a work-around/hack
     *
     * @return mixed
     */
    public function getOptions1Attribute()
    {
        if (is_string($this->options))
        {
            return json_decode($this->options);
        }

        return $this->options;
    }

    /**
     * @param $options
     * @return mixed
     */
    public function getOptionsAttribute($options)
    {
        return json_decode($options);
    }

    /**
     * Get votes count for each option
     *
     * @return array
     */
    public function getVotesAttribute()
    {
        $votes = [];

        if (is_string($this->options))
        {
            $options = json_decode($this->options);
        }
        else
        {
            $options = $this->options;
        }

        for ($i = 1; $i <= count($options); $i++)
        {
            $votes[$i] = PollVote::where('poll_id', $this->id)->whereOption($i)->count() ?: 0;
        }

        return $votes;
    }

    /**
     * @param $options
     * @return string
     */
    public function setOptionsAttribute($options)
    {
        $this->attributes['options'] = json_encode($options);
    }

    /**
     * If user has voted, they can't vote twice
     * Note: For now, we will let guests vote
     * even if it means they can vote more than once on a poll
     *
     * @return bool
     */
    public function getUserHasVotedAttribute()
    {
        return PollVote
            ::where('user_id', Auth::user()->id)
            ->where('poll_id', $this->id)
            ->first();
    }

    /**
     * @param array $attributes
     * @return static
     */
    public static function create(array $attributes = [])
    {
        // Set owner
        if (!App::runningInConsole())
            $attributes['user_id'] = Auth::user()->id;

        return parent::create($attributes);
    }

    /**
     * @param $input
     * @return bool|\Illuminate\Http\Response
     */
    public static function validate($input)
    {
//        if (Poll::wasCreatedYesterday())
//            Helpers::throwValidationException(['error' => ['Only 1 poll per 24 hours!']]);

        $v = Validator::make($input, self::$validationRules);

        if ($v->fails())
        {
            Helpers::throwValidationException($v->errors()->all());
        }

        if (count($input['options']) < 2) {
            Helpers::throwValidationException(['options' => ['Need at least two options.']]);
        }

        foreach ($input['options'] as $option) {
            if (strlen($option) > 30) {
                Helpers::throwValidationException(['options' => ['String too long.']]);
            }
        }

        return false;
    }

    /**
     * Get most recent poll, if it was within last 24 hours, return true
     * else return false
     *
     * @returns bool
     */
    public static function wasCreatedYesterday()
    {
        $mostRecentPoll = self::where('user_id', Auth::user()->id)->latest()->pluck('created_at');

        return $mostRecentPoll->gt(Carbon::now()->subDay());
    }
}