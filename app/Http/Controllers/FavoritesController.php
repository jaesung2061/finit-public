<?php namespace Finit\Http\Controllers;

use Auth;
use Dingo\Api\Http\Request;
use Finit\Http\Requests;
use Finit\Models\Chat\Favorite;
use Finit\WebSockets;

class FavoritesController extends Controller {
    /**
     * @var WebSockets
     */
    private $webSockets;

    /**
     * FavoritesController constructor.
     * @param WebSockets $webSockets
     */
    public function __construct(WebSockets $webSockets)
    {
        $this->webSockets = $webSockets;
        $this->middleware('jwt.auth');
    }

    /**
     * @return mixed
     */
    public function index()
    {
        $chatrooms = Favorite::where('user_id', Auth::user()->id)->get();

        $this->setActiveMembers($chatrooms);

        return response()->api($chatrooms->toArray());
    }

    /**
     * @param Request $request
     */
    public function store(Request $request)
    {
        $this->validate($request, ['title' => 'required|string']);

        $title = $request->get('title');
        $suffix = preg_replace('/[^\w-_]/', '', strtolower($title));;

        $attributes = [
            'user_id' => Auth::user()->id,
            'title'   => strtolower($title),
            'suffix'  => strtolower($suffix),
            'channel' => $request->get('channel')
        ];

        $favorite = Favorite::firstOrCreate($attributes);

        return response()->api($favorite->toArray());
    }

    /**
     * @param $channel
     */
    public function show($channel)
    {
        return response()->api(Favorite::whereChannel($channel)->first());
    }

    /**
     * @param Request $request
     * @param $id
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * @param $channel
     */
    public function destroy($channel)
    {
        $favorite = Favorite::whereChannel($channel)->whereUserId(Auth::user()->id)->first();

        if ($favorite) $favorite->delete();

        return $favorite;
    }

    /**
     * @param $chatrooms
     * @return mixed
     */
    private function setActiveMembers($chatrooms)
    {
        $channels = $this->webSockets->getChannels([
            'channels' => Favorite::where('user_id', Auth::user()->id)->lists('channel')->toArray()
        ]);

        foreach ($chatrooms as $chatroom)
        {
            foreach ($channels as $channel)
            {
                if ($chatroom->suffix == $channel->title)
                {
                    $chatroom->member_count = $channel->member_count;
                    break;
                }
            }

            if (!$chatroom->member_count)
                $chatroom->member_count = 0;

            $chatroom->isFavorite = true;
        }
    }
}
