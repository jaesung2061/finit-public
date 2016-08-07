<?php namespace Finit\Http\Controllers;

use Auth;
use Dingo\Api\Http\Request;
use Finit\Helpers;
use Finit\IpBan;
use Finit\Models\Chat\Message;
use Finit\Models\Notification;
use Finit\Models\User;
use Finit\WebSockets;
use Input;
use JWTAuth;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;

class WebSocketsController extends Controller {
    /**
     * @var WebSockets
     */
    protected $webSockets;

    /**
     * @param WebSockets $webSockets
     */
    public function __construct(WebSockets $webSockets)
    {
        $this->middleware('jwt.auth', ['except' => ['authenticate', 'notify', 'getChannels']]);
        $this->webSockets = $webSockets;
    }

    /**
     * @return mixed
     * @throws TokenExpiredException
     */
    public function authenticate(Request $request)
    {
        $user = JWTAuth::authenticate($request->get('token'));

        if (!$user)
        {
            throw new TokenExpiredException;
        }

        if (IpBan::whereIp($user->ip)->first())
        {
            throw new AccessDeniedHttpException();
        }

        $user = User::select([
            'id',
            'username',
            'picture_xs',
            'picture_sm',
            'picture_md',
            'picture_lg',
            'is_temp'
        ])->whereId($user->id)->first();

        $user->loadRegularTags();

        return $user;
    }

    /**
     * @param Request $request
     * @return mixed
     */
    public function trigger(Request $request)
    {
        $this->validate($request, [
            'body'    => 'required|string|max:255',
            'channel' => 'required|string'
        ]);

        $channel = $request->get('channel');
        $isCommand = preg_match('/^\/(kick|ban|unban)\s@?[a-zA-Z0-9]+(\\s[a-zA-Z0-9]+)?$/', $request->get('body'));
        $userIsMod = Auth::user()->id === 1 ?: in_array($channel, Auth::user()->mod_powers->toArray());
        $attributes = $request->except(['token']);
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
//        $message->load('sender');
//        $message->event = 'client-message';
//        $this->webSockets->trigger($channel, 'client-message', $message, Auth::user()->id);

        // We don't want it showing up on the logs for others to see
        if ($isCommand)
        {
            $message->delete();
        }

        return response()->api($message);
    }

    /**
     * The ws server will send a notify request which is
     * handled here. The notify request is sent when a
     * user sends a private message to another user
     * but the other user is not subscribed to the channel
     *
     * todo fix this
     * it's a concrete implementation and also ties
     * this server very closely with the ws server.
     */
    public function notify()
    {
        Notification::notify(Input::get('user_id'), Notification::PRIVATE_MESSAGE_RECEIVED, Input::all());
    }

    /**
     * @return mixed
     */
    public function getChannels()
    {
        return response()->api($this->webSockets->getChannels());
    }
}