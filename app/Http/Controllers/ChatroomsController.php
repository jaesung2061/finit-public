<?php namespace Finit\Http\Controllers;

use Auth;
use Dingo\Api\Http\Request;
use Finit\Helpers;
use Finit\Http\Requests;
use Finit\Models\Chat\Chatroom;
use Finit\Models\Photo;
use Finit\Models\User;
use Finit\WebSockets;

class ChatroomsController extends Controller {
    /**
     * @var WebSockets
     */
    private $webSockets;

    /**
     * ChatroomsController constructor.
     *
     * @param WebSockets $webSockets
     */
    public function __construct(WebSockets $webSockets)
    {
        $this->webSockets = $webSockets;
        $this->middleware('jwt.auth', ['except' => ['index', 'show']]);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $channels = $this->webSockets->getChannels();
        $in = [];

        // Prepare for whereIn query
        foreach ($channels as $channel)
        {
            $in[] = 'pub_' . strtolower($channel->title);
        }

        $chatrooms = Chatroom::whereIn('channel', $in)->get();

        // Set title and member count for chatroom objects
        foreach ($chatrooms as $chatroom)
        {
            foreach ($channels as $channel)
            {
                if ('pub_' . strtolower($channel->title) === $chatroom->channel)
                {
                    $chatroom->member_count = $channel->member_count;
                    $chatroom->title = $channel->title;
                    break;
                }
            }
        }

        return response()->api($chatrooms);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Dingo\Api\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        switch ($request->get('type'))
        {
            case 'public':
                $this->validate($request, [
                    'channel'           => 'required|regex:/^(pub_)[a-zA-Z0-9]+$/',
                    'description_short' => 'max:100',
                    'description'       => 'max:4096',
                    'tab_title'         => 'max:100',
                ]);

                return response()->api(Chatroom::firstOrCreatePublic($request));
            case 'protected':
                Chatroom::validateProtectedChatroom($request);

                return response()->api(Chatroom::firstOrCreateProtected($request));
            default:
                Helpers::throwValidationException(['errors' => ['Missing type.']]);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int $channel
     * @return \Illuminate\Http\Response
     */
    public function show($channel)
    {
        if (!starts_with($channel, 'pub_') && !starts_with($channel, 'prv_') && !starts_with($channel, 'pro_'))
        {
            $channel = 'pub_' . $channel;
        }

        $chatroom = Chatroom::firstOrCreate([
            'channel' => $channel
        ]);

        if (starts_with($channel, 'pro_'))
        {
            $chatroom->load('invites', 'invites.requester');
        }

        return response()->api($chatroom);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Dingo\Api\Http\Request $request
     * @param  int $channel
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $channel)
    {
        Helpers::currentUserNoTempAllowed();
        $chatroom = Chatroom::whereChannel($channel)->whereOwnerId(Auth::user()->id)->first();

        switch ($request->get('type'))
        {
            case 'claim':
                if (starts_with($channel, 'pro_'))
                    Helpers::throwValidationException(['error' => ['Invalid input']]);

                if (!starts_with($channel, 'pub_'))
                    $channel = 'pub_' . $channel;

                if (Chatroom::whereOwnerId(Auth::user()->id)->whereType('public')->first())
                    return response('You can only claim 1 hashtag.', 403);

                $chatroom = Chatroom::whereChannel($channel)->first();

                if (!$chatroom)
                    $chatroom = Chatroom::create(['channel' => $channel]);

                // If chatroom is owned && chatroom owner_id !== current user id, return error
                if ($chatroom->owner_id !== 0 && $chatroom->owner_id !== Auth::user()->id)
                    return response('This chatroom is already taken.', 409);

                $chatroom->owner_id = Auth::user()->id;
                $chatroom->save();
                break;
            case 'disclaim':
                if (!$chatroom)
                    return response('Couldn\'t find resource.', 404);

                $chatroom->owner_id = 0;
                $chatroom->save();
                break;
            case 'update':
                if (!$chatroom)
                {
                    if (Auth::user()->id === 1)
                        $chatroom = Chatroom::whereChannel($channel)->first();
                    else
                        return response('Forbidden', 403);
                }

                $this->validate($request, [
                    'description'       => 'max:4096',
                    'description_short' => 'max:150',
                    'tab_title'         => 'max:100',
                ], ['image.url' => 'Image url is invalid.']);

                $chatroom->update($request->only(['description_short', 'description', 'tab_title']));
                break;
            default:
                return response(['type' => ['Missing type.']], 422);
        }

        return response()->api($chatroom);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    /**
     * @param Request $request
     * @return mixed
     */
    public function photo(Request $request)
    {
        if (!Auth::user()->isOwnerOf($request->get('channel')))
        {
            return response('Forbidden', 403);
        }

        $user = User::find(Auth::user()->id);
        $chatroom = Chatroom::whereChannel($request->get('channel'))->first();
        $file = $request->file('file');

        Photo::validate($file);
        $img = Photo::handleFile($file);
        Photo::uploadAndSaveForChatroom($img, $chatroom);
        unlink($img->dirname . '/' . $img->basename);

        return response()->api($user->fresh()->toArray());
    }

}
