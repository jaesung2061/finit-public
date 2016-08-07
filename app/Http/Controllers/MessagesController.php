<?php namespace Finit\Http\Controllers;

use Auth;
use Dingo\Api\Http\Request;
use Finit\Helpers;
use Finit\Http\Requests;
use Finit\Models\Chat\Message;
use Finit\Models\Photo;
use Finit\Models\User;
use Finit\WebSockets;
use Symfony\Component\Finder\Exception\AccessDeniedException;

class MessagesController extends Controller {
    /**
     * @var WebSockets
     */
    private $webSockets;

    /**
     * MessagesController constructor.
     */
    public function __construct(WebSockets $webSockets)
    {
        $this->middleware('api.auth', ['except' => ['store']]);
        $this->webSockets = $webSockets;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if (substr($request->get('chatroom_channel'), 0, 4) === 'prv_')
        {
            $userIds = $this->getUserIds($request->get('chatroom_channel'));

            if (!in_array(Auth::user()->id, $userIds))
                throw new AccessDeniedException();
        }

        $messages = Message
            ::where('channel', $request->get('chatroom_channel'))
            ->select(['id', 'body', 'sender_id', 'photo_id', 'created_at'])
            ->with(['sender', 'photo'])->orderBy('id', 'DESC')->limit(100)->get();

        return response()->api($messages);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if ($request->get('secret') != env('WEBSOCKET_API_SECRET'))
        {
            throw new \Exception('Forbidden', 403);
        }

        $this->validate($request, [
            'body'    => 'required|string|max:255',
            'channel' => 'required|string'
        ]);

        $sender = User::find($request->get('sender_id'));
        $channel = $request->get('channel');
        $isCommand = preg_match('/^\/(kick|ban|unban)\s@?[a-zA-Z0-9]+(\\s[a-zA-Z0-9]+)?$/', $request->get('body'));
        $userIsMod = $sender->id === 1 ?: in_array($channel, $sender->mod_powers->toArray());
        $attributes = $request->except(['token', 'secret']);
        $attributes['body'] = str_replace("\xE2\x80\x8B", "", $attributes['body']); // Remove zero width spaces

        // If zero width spaces were removed and the body is empty, throw validation error
        if (!$attributes['body'])
        {
            Helpers::throwValidationException(['body' => ['required']]);
        }

        if ($isCommand && !$userIsMod)
        {
            return response('forbidden', 403);
        }

        $message = Message::create($attributes);

        // We don't want it showing up on the logs for others to see
        if ($isCommand)
        {
            $message->delete();
        }

        return response()->api($message);
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
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
     */
    public function photo(Request $request)
    {
        Helpers::currentUserNoTempAllowed();

        $this->validate($request, [
            'file'    => 'required|image',
            'channel' => 'required'
        ]);

        $message = Message::create([
            'channel'   => $request->get('channel'),
            'sender_id' => Auth::user()->id,
            'body'      => ''
        ]);

        $file = $request->file('file');
        Photo::uploadAndSaveForMessage($file, $message);
        unlink($file->getPath() . '/' . $file->getFilename());
        $message->load(['sender', 'photo']);

        $this->webSockets->trigger($request->get('channel'), 'client-message', $message, Auth::user()->id);

        return response()->api($message);
    }

    /**
     * @param $privateChannel
     * @return array
     */
    private function getUserIds($privateChannel)
    {
        $this->validatePrivateChannel($privateChannel);
        $privateChannel = substr($privateChannel, 4); // Remove prefix
        $userIds = array_map('intval', explode('_', $privateChannel)); // Get user ids
        return $userIds;
    }

    /**
     * @param $channel
     */
    private function validatePrivateChannel($channel)
    {
        if (!$channel || !preg_match('/^(prv_)[0-9]+_[0-9]+$/', $channel))
        {
            Helpers::throwValidationException(['channel' => ['Invalid channel']]);
        }
    }
}
