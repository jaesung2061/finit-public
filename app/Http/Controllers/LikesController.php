<?php namespace Finit\Http\Controllers;

use Auth;
use Dingo\Api\Http\Request;
use Finit\Helpers;
use Finit\Models\Like;
use Finit\Models\Notification;
use Finit\WebSockets;
use Input;
use Response;

class LikesController extends Controller {
    /**
     * @var WebSockets
     */
    private $webSockets;

    /**
     * @param WebSockets $webSockets
     */
    public function __construct(WebSockets $webSockets)
    {
        $this->webSockets = $webSockets;
        $this->middleware('jwt.auth');
    }

    /**
     * Display a listing of the resource.
     * GET /likes
     *
     * @return Response
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     * POST /likes
     *
     * @return Response
     */
    public function store(Request $request)
    {
        Helpers::currentUserNoTempAllowed();

        $this->validate($request, [
            'box_id'     => 'required_without:message_id',
            'message_id' => 'required_without:box_id',
        ]);

        $column = key($request->all());
        $id = $request->get($column);
        $currentUserId = Auth::user()->id;
        $like = Like::where($column, $id)->where('user_id', $currentUserId)->first();

        if ($like)
        {
            if ($like->message)
                $this->webSockets->trigger($like->message->channel, 'client-message-unstarred', $like);

            $like->delete();

            return Response::make('removed');
        }

        $like = Like::create([
            $column   => $id,
            'user_id' => $currentUserId
        ]);

        switch ($column)
        {
            case 'box_id':
//                $this->notifyParties($like, substr($column, 0, -3));
                break;
            case 'message_id':
                $senderId = $like->message->sender_id;

                if ($senderId !== $currentUserId)
                {
                    Notification::notify($senderId, Notification::CHAT_MESSAGE_LIKED);
                }

                $this->webSockets->trigger(
                    Input::get('chatroom_channel'),
                    'client-message-starred',
                    $like
                );

                break;
        }

        return response()->api($like->toArray());
    }

    /**
     * Display the specified resource.
     * GET /likes/{id}
     *
     * @param  int $id
     * @return Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     * PUT /likes/{id}
     *
     * @param  int $id
     * @return Response
     */
    public function update($id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /likes/{id}
     *
     * @param  int $id
     * @return Response
     */
    public function destroy($id)
    {
        //
    }

    /**
     * @param $like
     * @param $type
     */
    private function notifyParties($like, $type)
    {
        $currentUser = Auth::user();
        $taker = null;
        $giver = null;

        switch ($type)
        {
            case 'box':
                $box = $like->box;
                $taker = $box->taker;
                $giver = $box->giver;
                $this->webSockets->trigger('box_' . $box->id, 'box-like', $like);
                break;
        }

        if (!$taker || !$giver) return;

        // Warning: fucking confusing.
        // We need to figure out exactly who we need to send notifications to
        // todo allow others to subscribe to notifications for this box
        if ($currentUser->isNot($taker) && $currentUser->isNot($giver))
        {
            // CURRENT USER IS NOT COMMENTING ON MY OWN BOX THAT I GAVE MYSELF
            if ($giver->is($taker))
            {
                // CURRENT USER IS COMMENTING ON A BOX THAT MY FRIEND GAVE TO HIMSELF
                Notification::notify($taker, Notification::BOX_LIKED);
            }
            else if ($giver->isNot($taker))
            {
                // CURRENT USER IS COMMENTING ON A BOX THAT A FRIEND GAVE TO ANOTHER FRIEND
                Notification::notify([$taker, $giver], Notification::BOX_LIKED);
            }
        }
        else if ($currentUser->isNot($giver) && $currentUser->is($taker))
        {
            // CURRENT USER IS COMMENTING ON A BOX THAT MY FRIEND GAVE TO ME
            Notification::notify($giver, Notification::BOX_LIKED);
        }
        else if ($currentUser->isNot($taker) && $currentUser->is($giver))
        {
            // CURRENT USER IS COMMENTING ON A BOX I GAVE TO MY FRIEND
            Notification::notify($taker, Notification::BOX_LIKED);
        }
    }
}