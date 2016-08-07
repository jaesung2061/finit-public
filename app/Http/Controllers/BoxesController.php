<?php namespace Finit\Http\Controllers;

use Auth;
use Exception;
use Finit\Helpers;
use Finit\Models\Box;
use Finit\Models\Comment;
use Finit\Models\Notification;
use Finit\Models\Photo;
use Finit\Models\User;
use Finit\WebSockets;
use Input;
use Response;

class BoxesController extends Controller {
    /**
     * @var WebSockets
     */
    protected $webSockets;

    /**
     * @param WebSockets $webSockets
     */
    public function __construct(WebSockets $webSockets)
    {
        $this->webSockets = $webSockets;
        $this->middleware('jwt.auth');
    }

    /**
     * Get paginated boxes.
     *
     * @return Response
     */
    public function index()
    {
        $id = User::whereUsername(Input::get('username'))->value('id');
        $boxes = Box::where('taker_id', $id)->latest()->with(['giver', 'photo'])->paginate(20);

        return response()->api($boxes->toArray());
    }

    /**
     * Create a new box
     *
     * @return Response
     */
    public function store()
    {
        Helpers::noTempAccounts(Input::get('taker_id'));
        Box::validate(Input::all());

        $takerId = Input::get('taker_id');
        $box = Box::create(Input::all());

        if ($takerId != Auth::user()->id)
            Notification::notify($takerId, Notification::BOX_RECEIVED);

        $box->load('comments', 'giver');

        return response()->api($box);
    }

    /**
     * Create new box photo
     *
     * @return Response
     */
    public function photo()
    {
        Helpers::noTempAccounts(Input::get('taker_id'));
        $file = Input::file('file');
        $input = Input::all();

        Photo::validate($file);
        Box::validate($input, true);

        $img = Photo::handleFile($file);
        $photo = Photo::createForBox($img);
        $box = Box::createWithPhoto($input, $photo);

        unlink($img->dirname . '/' . $img->basename);

        if ($input['taker_id'] != Auth::user()->id)
            Notification::notify($input['taker_id'], Notification::BOX_RECEIVED);

        $box->load('comments', 'giver', 'photo');

        return response()->api($box);
    }

    /**
     * Update Box
     *
     * @param  int $id
     * @return Response
     */
    public function update($id)
    {
        //
    }

    /**
     * @param $id
     * @throws Exception
     * @return Response
     */
    public function destroy($id)
    {
        Helpers::noTempAccounts(Input::get('taker_id'));
        $box = Box::where('id', $id)->first();

        if ($box->photo_id)
        {
            $box->photo->delete();
        }

        $currentUserId = Auth::user()->id;

        // If the user isn't the giver or taker, they cannot delete the box
        if ($currentUserId !== $box->giver_id && $currentUserId !== $box->taker_id)
            throw new Exception('Not authorized', 403);

        $box->delete();

        return response()->api($box);
    }

    /**
     * Get comments count
     *
     * @param $id
     * @return int
     */
    public function commentsCount($id)
    {
        return Comment::where('box_id', $id)->count();
    }
}