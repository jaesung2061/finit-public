<?php namespace Finit\Http\Controllers;

use Auth;
use Dingo\Api\Http\Request;
use Finit\Http\Requests;
use Finit\Models\Chat\Chatroom;
use Finit\Models\Moderator;
use Finit\Models\Notification;
use Finit\Models\User;
use Input;
use Response;

class ModeratorsController extends Controller {
    /**
     * ModeratorsController constructor.
     */
    public function __construct()
    {
        $this->middleware('jwt.auth');
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $moderators = Moderator::whereChannel($request->get('channel'))->whereApproved(1)->with('user');

        return response()->api($moderators->get()->toArray());
    }

    /**
     * This method will not be used
     *
     * @param  \Dingo\Api\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if (!Auth::user()->isOwnerOf($request->get('channel')) && Auth::user()->id !== 1)
        {
            return response('Forbidden', 403);
        }

        $userToMod = User::whereUsername($request->get('username'))->first();

        if ($userToMod->is_temp)
        {
            return response(['user' => ['User is a guest and cannot be promoted to moderator.']], 422);
        }

        $moderator = Moderator::firstOrCreate([
            'user_id' => $userToMod->id,
            'channel' => $request->get('channel')
        ]);

        $moderator->approved = 1;
        $moderator->save();
        $moderator->load('user');

        Notification::notify($userToMod->id, Notification::PROMOTED_TO_MOD, [
            'chatroom' => Chatroom::whereChannel($request->get('channel'))->first()
        ]);

        return response()->api($moderator);
    }

    /**
     * Return if user is mod or not
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $isMod = Moderator::where('user_id', $id)->whereChannel(Input::get('channel'));

        if ($isMod)
        {
            return 'good';
        }
        else
        {
            return Response::make('forbidden', 403);
        }
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
        $moderator = Moderator::find($id);

        if ($moderator)
        {
            $moderator->delete(0);
            Notification::notify($moderator->user->id, Notification::DEMOTED_AS_MOD, [
                'chatroom' => Chatroom::whereChannel($moderator->channel)->first()
            ]);
        }

        return response()->api($moderator);
    }
}
