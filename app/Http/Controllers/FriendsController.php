<?php namespace Finit\Http\Controllers;

use Auth;
use Dingo\Api\Http\Request;
use Finit\FriendRepository;
use Finit\Helpers;
use Finit\Http\Requests;
use Finit\Models\Friend;
use Finit\Models\Notification;
use Finit\Models\User;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class FriendsController extends Controller {
    /**
     *
     */
    public function __construct()
    {
        $this->middleware('jwt.auth', ['except' => 'index']);
    }

    /**
     * Get (CURRENT) user's friends
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if ($request->get('userId'))
        {
            $friends = FriendRepository::getFriends($request->get('userId'));
        }
        else
        {
            $this->authenticateUser();
            $friends = FriendRepository::getFriends(Auth::user()->id);
        }

        return response()->api($friends);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Dingo\Api\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        Helpers::noTempAccounts($request->get('userId'));

        $user = User::find($request->get('userId'));

        if (!$user)
        {
            return response('Not found', 404);
        }

        $friend = null;

        $this->validate($request, [
            'type'   => 'required|in:initiate,confirm',
            'userId' => 'required|integer',
        ]);

        if ($request->get('type') === 'initiate')
        {
            if ($user->hasMuted(Auth::user()->id))
            {
                return response('User has muted you.', 403);
            }

            $friend = Friend::whereRequester($request->get('userId'));

            if ($friend)
            {
                return response('Request was already received', 409);
            }

            $friend = Friend::firstOrCreate([
                'requester_id' => Auth::user()->id,
                'accepter_id'  => $request->get('userId'),
                'status'       => 1
            ]);

            Notification::notify($friend->accepter, Notification::FRIEND_REQUEST_RECEIVED, $friend);
        }
        else if ($request->get('type') === 'confirm')
        {
            $friend = Friend::whereRequester($request->get('userId'));

            if (!$friend) throw new NotFoundHttpException();

            $friend->update(['status' => 2]);

            Notification::notify($friend->requester, Notification::FRIEND_REQUEST_ACCEPTED, $friend);
        }

        return response()->api($friend->toArray());
    }

    /**
     * If checkFriendLink, return friend link with provided id
     * and current (auth) user id
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return response()->api(FriendRepository::findFriendLink($id));
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
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function destroy($id, Request $request)
    {
        Helpers::noTempAccounts($id);

        switch ($request->get('type'))
        {
            case 'requesterCancelsRequest':
                return response()->api(FriendRepository::cancelRequest($id));
            case 'currentUserRemovesFriend':
                return response()->api(FriendRepository::removeFriend($id));
            case 'accepterDeclinesRequest':
                return response()->api(FriendRepository::declineRequest($id));
            default:
                throw new BadRequestHttpException();
        }
    }

    /**
     * @return \Illuminate\Http\Response
     */
    public function requests()
    {
        $requests = FriendRepository::getFriendRequests(Auth::user()->id);

        return response()->api(FriendRepository::filter($requests));
    }

    /**
     * Get mutual friends
     *
     * @param $id
     * @return mixed
     */
    public function mutual($id)
    {
        return response()->api(FriendRepository::getMutualFriends(Auth::user()->id, $id));
    }
}
