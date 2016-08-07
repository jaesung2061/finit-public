<?php namespace Finit\Models;

use App;
use Auth;
use Carbon\Carbon;
use Exception;
use Finit\Helpers;
use Response;
use Validator;

class Box extends BaseModel {
    /**
     * @var array
     */
    protected $fillable = [
        'giver_id',
        'taker_id',
        'body',
        'width',
        'height',
        'color',
        'class',
        'photo_id'
    ];
    /**
     * @var string
     */
    protected $table = 'boxes';
    /**
     * @var array
     */
    protected $appends = ['time_ago', 'starsCount', 'commentsCount', 'currentUserLiked'];

    /**
     * @return string
     */
    public function getTimeAgoAttribute()
    {
        return $this->attributes['timeAgo'] = (new Carbon($this->attributes['created_at']))->diffForHumans();
    }

    /**
     * @return $this
     */
    public function getStarsCountAttribute()
    {
        return $this->attributes['starsCount'] = Like::where('box_id', $this->attributes['id'])->count();
    }

    /**
     * @return int
     */
    public function getCommentsCountAttribute()
    {
        return $this->attributes['commentsCount'] = Comment::where('box_id', $this->attributes['id'])->count();
    }

    /**
     * @return $this|bool
     */
    public function getCurrentUserLikedAttribute()
    {
        if (Auth::user()) {
            return $this->attributes['isLikedByCurrentUser'] = Like::where('box_id', $this->attributes['id'])->where('user_id', Auth::user()->id)->first();
        }

        return $this->attributes['isLikedByCurrentUser'] = false;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function giver()
    {
        return $this->belongsTo('Finit\Models\User')->select(['id', 'username', 'picture_xs']);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function taker()
    {
        return $this->belongsTo('Finit\Models\User')->select(['id', 'username', 'picture_xs']);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function comments()
    {
        return $this->hasMany('Finit\Models\Comment');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function likes()
    {
        return $this->hasMany('Finit\Models\Like');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function photo()
    {
        return $this->belongsTo('Finit\Models\Photo');
    }

    /**
     * @param array $attributes
     * @return static
     */
    public static function create(array $attributes = [])
    {
        if (!App::runningInConsole())
            $attributes['giver_id'] = Auth::user()->id;

        $attributes['class'] = Box::generateBoxClass($attributes['width'], $attributes['height'], $attributes['color']);

        return parent::create($attributes);
    }

    /**
     * @param $input
     * @param bool $forPhoto
     * @return \Illuminate\Http\Response|null
     * @throws Exception
     */
    public static function validate($input, $forPhoto = false)
    {
        $currentUser = Auth::user();
        $rules = Box::generateValidationRules($input['width'], $input['height'], $forPhoto);
        $errors = Box::generateValidationErrors($input['width'], $input['height']);
        $validator = Validator::make($input, $rules, $errors);

        if ($validator->fails()) {
            Helpers::throwValidationException($validator->messages()->toArray());
        }

        if (!$currentUser->isFriendsWith($input['taker_id']) && !$currentUser->is($input['taker_id']))
            return Response::make('Not authorized', 403);

        return null;
    }

    /**
     * @param $input
     * @param Photo $photo
     * @return Box
     */
    public static function createWithPhoto($input, Photo $photo)
    {
        $input['photo_id'] = $photo->id;

        return Box::create($input);
    }

    /**
     * @param $input
     */
    public static function validatePhoto($input)
    {
        $v = Validator::make($input, [
            'file' => 'required|image'
        ]);

        if ($v->errors()) {
            Helpers::throwValidationException($v->errors()->toArray());
        }
    }

    /**
     * Generate the class for the box based on width height and color
     *
     * @param $input
     * @return string
     */
    public static function generateBoxClass($width, $height, $color)
    {
        $class = "md-color $color hue-200 ";

        if ($width == 2)
            $class .= 'box-width-2 ';
        if ($height == 2)
            $class .= 'box-height-2';

        return $class;
    }

    /**
     * Generate the validation rules based on box size
     * the max character limit varies based on box width and height
     *
     * @param $width
     * @param $height
     * @throws Exception
     * @return array
     */
    public static function generateValidationRules($width, $height, $forPhoto = false)
    {
        if (!$width || !$height)
            throw new Exception('Need dimensions');

        $maxCharacterCount = self::computeMaxAllowableCharacters($width, $height);

        $rules = [
            'body'   => 'required|max:' . $maxCharacterCount,
            'width'  => 'required|in:1,2',
            'height' => 'required|in:1,2',
            'color'  => "required|in:red,pink,purple,deep-purple,indigo,blue,light-blue,cyan,teal,green,light-green,lime,yellow,amber,orange,deep-orange,brown,grey,blue-grey",
        ];

        if ($forPhoto) {
            // Get rid of body required rule for photo boxes
            $rules['body'] = 'max:' . $maxCharacterCount;
        }

        return $rules;
    }

    /**
     * The message varies based on box width and height
     *
     * @param $width
     * @param $height
     * @throws Exception
     * @return array
     */
    public static function generateValidationErrors($width, $height)
    {
        if (!$width || !$height)
            throw new Exception('Need dimensions');

        $maxCharacterCount = self::computeMaxAllowableCharacters($width, $height);

        return [
            'body.required'   => 'Please enter some content for the box.',
            'body.max'        => 'The max for this box size is ' . $maxCharacterCount . ' characters.',
            'width.required'  => 'Please select a box size',
            'height.required' => 'Please select a box size',
        ];
    }

    /**
     * Returns max allowable charactors based
     * box dimensions
     *
     * @param $width
     * @param $height
     * @return int
     */
    private static function computeMaxAllowableCharacters($width, $height)
    {
        if ($width + $height == 2)
            return 200;
        else if ($width + $height == 3)
            return 400;
        else if ($width + $height == 4)
            return 800;
    }
}