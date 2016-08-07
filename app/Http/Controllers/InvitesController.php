<?php namespace Finit\Http\Controllers;

use Auth;
use Dingo\Api\Http\Request;
use Finit\Helpers;
use Finit\Http\Requests;
use Finit\Models\Chat\Chatroom;
use Finit\Models\Invite;
use Finit\Models\Notification;
use Finit\Models\User;
use Finit\WebSockets;
use Illuminate\Database\Eloquent\Collection;

class InvitesController extends Controller {
    /**
     * @var WebSockets
     */
    private $webSockets;

    /**
     * InvitesController constructor.
     * @param WebSockets $webSockets
     */
    public function __construct(WebSockets $webSockets)
    {
        $this->middleware('jwt.auth');
        $this->webSockets = $webSockets;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Dingo\Api\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        Helpers::currentUserNoTempAllowed();

        $this->validate($request, [
            'channel' => 'required'
        ]);

        $collection = new Collection();
        $chatroom = Chatroom::whereChannel($request->get('channel'))->first();

        if (!starts_with($request->get('channel'), 'pro_') || !$chatroom)
            Helpers::throwValidationException(['error' => ['Invalid input']]);

        if (!is_array($request->get('invites')))
            $invites = [$request->get('invites')];
        else
            $invites = $request->get('invites');

        $invites = User::whereIn('username', $invites)->lists('id');

        foreach ($invites as $userId)
        {
            $invite = Invite::create([
                'requester_id' => Auth::user()->id,
                'accepter_id'  => $userId,
                'channel'      => $request->get('channel')
            ]);

            $collection->push($invite);
        }

        Notification::notify(
            $collection->lists('accepter_id')->toArray(),
            Notification::CHAT_INVITE_PROTECTED_RECEIVED,
            ['chatroom' => $chatroom]
        );
        $this->webSockets->updateChatroomState([
            'channel'  => $chatroom->channel,
            'property' => 'invites',
            'value'    => Invite::whereChannel($chatroom->channel)->get()
        ]);

        return response()->api($collection->toArray());
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
     * @param  \Dingo\Api\Http\Request $request
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
}
