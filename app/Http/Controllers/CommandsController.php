<?php namespace Finit\Http\Controllers;

use Auth;
use Dingo\Api\Http\Request;
use Finit\Http\Requests;
use Finit\IpBan;
use Finit\Models\Chat\Chatroom;
use Finit\Models\Chat\Favorite;
use Finit\Models\Chat\Regular;
use Finit\Models\Mute;
use Finit\Models\Rule;
use Finit\Models\User;
use Finit\WebSockets;

class CommandsController extends Controller {
    /**
     * @var WebSockets
     */
    private $webSockets;
    /**
     * @var array
     */
    private $commands = [
        'kick'      => [
            'auth'              => 'mod',
            'requiresOtherUser' => true,
            'selfTargetable'    => false
        ],
        'ban'       => [
            'auth'              => 'mod',
            'requiresOtherUser' => true,
            'selfTargetable'    => false
        ],
        'unban'     => [
            'auth'              => 'mod',
            'requiresOtherUser' => true,
            'selfTargetable'    => false
        ],
        'reg'       => [
            'auth'              => 'mod',
            'requiresOtherUser' => true,
            'selfTargetable'    => true
        ],
        'dereg'     => [
            'auth'              => 'mod',
            'requiresOtherUser' => true,
            'selfTargetable'    => true
        ],
        'mode'      => [
            'auth'              => 'mod',
            'requiresOtherUser' => false,
            'selfTargetable'    => false
        ],
        'mute'      => [
            'auth'              => '',
            'requiresOtherUser' => true,
            'selfTargetable'    => false
        ],
        'unmute'    => [
            'auth'              => '',
            'requiresOtherUser' => true,
            'selfTargetable'    => false
        ],
        'banip'     => [
            'auth'              => 'admin',
            'requiresOtherUser' => true,
            'selfTargetable'    => false
        ],
        'unbanip'   => [
            'auth'              => 'admin',
            'requiresOtherUser' => true,
            'selfTargetable'    => false
        ],
        'shadowban' => [
            'auth'              => 'admin',
            'requiresOtherUser' => true,
            'selfTargetable'    => false
        ]
    ];

    /**
     * CommandsController constructor.
     * @param WebSockets $webSockets
     */
    public function __construct(WebSockets $webSockets)
    {
        $this->middleware('jwt.auth');
        $this->webSockets = $webSockets;
    }

    /**
     * @param Request $request
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    public function execute(Request $request)
    {
        if ($errorResponse = $this->validateCommand($request))
            return $errorResponse;

        if ($errorResponse = $this->authenticateCommand($request))
            return $errorResponse;

        return $this->executeCommand($request);
    }

    /**
     * @param $request
     * @return bool|\Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    private function validateCommand($request)
    {
        if (!isset($this->commands[$request->get('command')]))
            return response('Bad input.', 422);

        $command = $this->commands[$request->get('command')];
        $otherUserUsername = str_replace(['@', ' '], '', $request->get('args')[0]);
        $otherUser = User::byUsername($otherUserUsername);

        if ($command['requiresOtherUser'] == true && !$otherUser)
            return response("Couldn't find @{$otherUserUsername}.", 404);

        return false;
    }

    /**
     * @param $request
     * @return bool
     */
    private function authenticateCommand($request)
    {
        $command = $this->commands[$request->get('command')];
        $channel = $request->get('channel');
        $currentUserIsAdmin = Auth::user()->id === 1;
        $otherUserUsername = str_replace(['@', ' '], '', $request->get('args')[0]);
        $otherUser = User::byUsername($otherUserUsername);
        $currentUserIsMod = Auth::user()->isModFor($channel);
        $currentUserIsOwner = Auth::user()->isOwnerOf($channel);

        switch ($command['auth'])
        {
            case 'admin':
                if (!$currentUserIsAdmin)
                    return response('Forbidden', 403);
                break;
            case 'mod':
                if (!$currentUserIsMod && !$currentUserIsOwner && !$currentUserIsAdmin)
                    return response('Forbidden', 403);
                break;
        }

        // check if trying to ban owner
        if ($command['requiresOtherUser'])
        {
            // If other user is owner and the current user is not admin, return error response
            if ($otherUser->isOwnerOf($channel) && !$currentUserIsAdmin)
                return response('Forbidden', 403);

            // If other user is a mod, and current user is owner or mod, return error response
            if ($otherUser->isModFor($channel) && !($currentUserIsOwner || $currentUserIsAdmin))
                return response('Forbidden', 403);
        }

        if (!$command['selfTargetable'] && Auth::user()->is($otherUser))
            return response("You cannot do this to yourself.", 422);

        return false;
    }

    /**
     * @param $request
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    private function executeCommand($request)
    {
        $otherUserUsername = str_replace(['@', ' '], '', $request->get('args')[0]);
        $otherUser = User::byUsername($otherUserUsername);

        switch ($request->get('command'))
        {
            case 'ban':
                return $this->banUser($request, $otherUser);
            case 'unban':
                return $this->unbanUser($request, $otherUser);
            case 'kick':
                return $this->kickUser($request, $otherUser);
            case 'shadowban':
                return $this->shadowbanUser($request);
            case 'banip':
                return $this->banIp($request, $otherUser);
            case 'unbanip':
                return $this->unbanIp($request, $otherUser);
            case 'reg':
                return $this->tagUserAsRegular($request, $otherUser);
            case 'dereg':
                return $this->untagUserAsRegular($request, $otherUser);
            case 'mode':
                return $this->setChatroomMode($request);
            case 'mute':
                return $this->muteUser($request, $otherUser);
            case 'unmute':
                return $this->unmuteUser($request, $otherUser);
            default:
                return response('Bad input', 422);
        }
    }

    /**
     * @param $request
     * @param $otherUser
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    private function banUser($request, $otherUser)
    {
        Rule::firstOrCreate([
            'user_id'   => $otherUser->id,
            'source_id' => Auth::user()->id,
            'channel'   => $request->get('channel'),
            'type'      => 'ban'
        ]);

        Favorite::whereChannel($request->get('channel'))->whereUserId($otherUser->id)->delete();

        $this->webSockets->command([
            'command' => $request->get('command'),
            'data'    => $request->only(['args', 'channel'])
        ]);

        return response("You have banned $otherUser->username.");
    }

    /**
     * @param $request
     * @param $otherUser
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    private function unbanUser($request, $otherUser)
    {
        $count = Rule::whereUserId($otherUser->id)->whereChannel($request->get('channel'))->delete();

        if ($count === 0)
        {
            return response("We couldn't find a ban listing for @$otherUser->username in this channel.", 404);
        }

        $this->webSockets->command([
            'command' => $request->get('command'),
            'data'    => $request->only(['args', 'channel'])
        ]);

        return response("You have unbanned $otherUser->username.");
    }

    /**
     * @param $request
     * @param $otherUser
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    private function kickUser($request, $otherUser)
    {
        Favorite::whereChannel($request->get('channel'))->whereUserId($otherUser->id)->delete();

        try
        {
            $this->webSockets->command([
                'command' => $request->get('command'),
                'data'    => $request->only(['args', 'channel'])
            ]);

            return response("You have kicked @{$otherUser->username}.");
        }
        catch (\Exception $e)
        {
            return response("Couldn't find @{$otherUser->username} channel, please check your input.", 404);
        }
    }

    /**
     * @param $request
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    private function shadowbanUser($request)
    {
        // Only I can do this
        if (Auth::user()->id !== 1)
            return response('Invalid Input.', 403);

        $this->webSockets->command([
            'command' => $request->get('command'),
            'data'    => $request->only(['args', 'channel'])
        ]);

        return response('good.');
    }

    /**
     * @param $request
     * @param $otherUser
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    private function banIp($request, $otherUser)
    {
        if (Auth::user()->id !== 1)
            return response('Forbidden', 403);

        IpBan::firstOrCreate(['ip' => $otherUser->ip]);

        $this->webSockets->command([
            'command' => 'disconnect-user',
            'data'    => ['args' => [$otherUser->username]]
        ]);

        return response('Good');
    }

    /**
     * @param $request
     * @param $otherUser
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    private function unbanIp($request, $otherUser)
    {
        if (Auth::user()->id !== 1)
            return response('Forbidden', 403);

        $ipBan = IpBan::where('ip', $otherUser->ip)->first();

        if ($ipBan)
        {
            $ipBan->delete();
            return response('Good');
        }

        return response('Couldn\'t find ban record for that user', 404);
    }

    /**
     * @param $request
     * @param $otherUser
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    private function tagUserAsRegular($request, $otherUser)
    {
        Regular::firstOrCreate([
            'user_id' => $otherUser->id,
            'channel' => $request->get('channel')
        ]);

        // TODO send req to websocket to update state data
        $this->webSockets->updateUserState([
            'user_id'  => $otherUser->id,
            'property' => 'regularTags',
            'value'    => Regular::whereUserId($otherUser->id)->lists('channel')
        ]);

        return response("You have tagged @{$otherUser->username} as a regular.");
    }

    /**
     * @param $request
     * @param $otherUser
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    private function untagUserAsRegular($request, $otherUser)
    {
        $regular = Regular
            ::whereUserId($otherUser->id)
            ->whereChannel($request->get('channel'))
            ->first();

        if ($regular)
        {
            $regular->delete();

            $this->webSockets->updateUserState([
                'channel'  => $request->get('channel'),
                'user_id'  => $otherUser->id,
                'property' => 'regularTags',
                'value'    => Regular::whereUserId($otherUser->id)->lists('channel')
            ]);

            return response("You have removed @{$otherUser->username} as a regular.");
        }

        return response('Couldn\'t find resource', 404);
    }

    /**
     * @param $request
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    private function setChatroomMode($request)
    {
        $mode = $request->get('args')[0];

        if (!$mode || !in_array($mode, Chatroom::$modes))
            return response('Bad input.', 422);

        $chatroom = Chatroom::whereChannel($request->get('channel'))->first();

        if ($chatroom)
        {
            $chatroom->setMode($mode);

            $this->webSockets->updateChatroomState([
                'channel'  => $request->get('channel'),
                'property' => 'settings',
                'value'    => $chatroom->settings
            ]);
        }

        return response('Chatroom mode has been set to "' . $mode . '".');
    }

    /**
     * @param $request
     * @param $otherUser
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    private function muteUser($request, $otherUser)
    {
        if (!$otherUser)
            return response('Couldn\'t find user', 404);

        if (Auth::user()->is($otherUser))
            return response("You cannot do this to yourself.", 422);

        Mute::firstOrCreate([
            'muter_id' => Auth::user()->id,
            'muted_id' => $otherUser->id
        ]);

        return response('You have muted @' . $otherUser->username);
    }

    /**
     * @param $request
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    private function unmuteUser($request, $otherUser)
    {
        if (!$otherUser)
            return response('Couldn\'t find user', 404);

        $rule = Mute::whereMuterId(Auth::user()->id)->whereMutedId($otherUser->id)->first();

        if (!$rule)
            return response('You never muted this user, please check your input.', 404);

        $rule->delete();

        return response('You have unmuted @' . $otherUser->username);
    }
}
