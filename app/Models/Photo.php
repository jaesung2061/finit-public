<?php namespace Finit\Models;

use Auth;
use Finit\Helpers;
use Finit\ResizeFilter;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;
use Storage;
use Validator;

class Photo extends BaseModel {
    /**
     * @var array
     */
    protected $fillable = [
        'user_id',
        'box_id',
        'message_id',
        'uri',
        'description',
        'is_profile_picture',
    ];
    /**
     * @var string
     */
    protected $table = 'photos';
    /**
     * @var array
     */
    protected $appends = ['url'];
    /**
     * Used for resizing profile picture images
     *
     * @var array
     */
    public static $sizes = [
        'lg' => 512,
        'md' => 256,
        'sm' => 128,
        'xs' => 32
    ];

    public function getUrlAttribute()
    {
        return $this->attributes['url'] = env('RACKSPACE_BASE_URL') . $this->attributes['uri'];
    }

    /**
     * @param $img
     * @return static
     */
    public static function createForBox($img)
    {
        $uri = Auth::user()->id . '/box/' . Str::random(32) . '.jpg';

        Storage::put($uri, $img->encode('jpg'));

        $attributes = [
            'user_id' => Auth::user()->id,
            'uri'     => $uri,
        ];

        return parent::create($attributes);
    }

    /**
     * @param $photo
     */
    public static function validate($photo)
    {
        $v = Validator::make(['file' => $photo], [
            'file' => 'required|mimes:jpeg,bmp,png'
        ]);

        if ($v->fails())
        {
            Helpers::throwValidationException($v->errors()->toArray());
        }
    }

    /**
     * @param $file
     * @return mixed
     */
    public static function handleFile($file)
    {
        $fileName = Str::random(24) . '.' . substr($file->getMimeType(), strrpos($file->getMimeType(), '/') + 1);
        $file->move(storage_path('temp'), $fileName);
        return Image::make(storage_path('temp') . '/' . $fileName);
    }

    /**
     * @param $img
     */
    public static function uploadAndSave($img)
    {
        // Unset current profile picture
        self::unsetProfilePicture();

        $fileName = Str::random(32);

        foreach (self::$sizes as $sizeName => $size)
        {
            $uri = Auth::user()->id . '/' . $fileName . '.' . $sizeName . '.jpg';

            $img->filter(new ResizeFilter($size));

            Storage::put($uri, $img->encode('jpg'));

            self::create([
                'user_id'            => Auth::user()->id,
                'uri'                => $uri,
                'is_profile_picture' => true
            ]);

            User::updateProfilePicture($uri, $sizeName);
        }
    }

    /**
     * @param $img
     * @param $channel
     * @return mixed
     */
    public static function uploadAndSaveForChatroom($img, $chatroom)
    {
        $fileName = 'image';
        $uri = 'chat/' . $chatroom->channel . '/' . $fileName . '.jpg';
        $img->filter(new ResizeFilter(128));
        Storage::put($uri, $img->encode('jpg'));
        $chatroom->image = env('RACKSPACE_BASE_URL') . $uri;
        $chatroom->save();

        return $img;
    }

    /**
     * @param $file
     * @param $message
     */
    public static function uploadAndSaveForMessage($file, $message)
    {
        $extensionName = substr($file->getMimeType(), strrpos($file->getMimeType(), '/') + 1);
        $uri = 'message/' . $message->id . '.' . $extensionName;

        Storage::put($uri, file_get_contents($file->getPath() . '/' . $file->getFilename()));

        $photo = Photo::create([
            'message_id' => $message->id,
            'user_id'    => Auth::user()->id,
            'uri'        => $uri
        ]);

        $message->photo_id = $photo->id;
        $message->save();

        return $file;
    }

    /**
     * Unset current user's profile picture
     */
    public static function unsetProfilePicture()
    {
        $profile_pictures = self::where('user_id', Auth::user()->id)
            ->whereNotNull('is_profile_picture')->get();

        foreach ($profile_pictures as $picture)
        {
            $picture->update([
                'is_profile_picture' => null
            ]);
        }
    }

    /**
     * Listen for events
     */
    public static function boot()
    {
        parent::boot();

        static::deleting(function ($photo)
        {
            Storage::delete($photo->uri);
        });
    }
}
