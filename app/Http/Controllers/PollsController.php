<?php namespace Finit\Http\Controllers;

use Auth;
use Dingo\Api\Http\Request;
use Finit\Helpers;
use Finit\Models\Chat\Poll;
use Finit\Models\Chat\PollVote;
use Finit\WebSockets;
use Response;

class PollsController extends Controller {
    /**
     * @var WebSockets
     */
    protected $webSockets;

    /**
     * PollsController constructor.
     *
     * @param WebSockets $webSockets
     */
    public function __construct(WebSockets $webSockets)
    {
        $this->middleware('jwt.auth');
        $this->webSockets = $webSockets;
    }

    /**
     * Display a listing of the resource.
     * GET /polls
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request)
    {
        $channel = 'pub_' . $request->get('suffix');

        $polls = Poll
            ::where('chatroom_channel', $channel)
            ->latest('created_at')
            ->paginate($request->get('perPage') ?: 1);

        foreach ($polls as $poll) {
            unset($poll->user_id);
        }

        return response()->api($polls->toArray());
    }

    /**
     * Store a newly created resource in storage.
     * POST /polls
     *
     * @param Request $request
     * @return Response
     */
    public function store(Request $request)
    {
        Helpers::currentUserNoTempAllowed();

        $input = $request->all();
        $input['options'] = array_filter($input['options']);

        Poll::validate($input);

        $poll = Poll::create($input);

        $poll->fresh();

        $this->webSockets->trigger($request->get('chatroom_channel'), 'client-poll-posted', $poll->toArray(), Auth::user()->id);

        return response()->api($poll->toArray());
    }

    /**
     * Display the specified resource.
     * GET /polls/{id}
     *
     * @param  int $id
     * @return Response
     */
    public function show($id)
    {
        $poll = Poll::find($id);

        $poll = $poll->toArray();
        unset($poll['user_id']);

        return response()->api($poll);
    }

    /**
     * Update the specified resource in storage.
     * PUT /polls/{id}
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
     * DELETE /polls/{id}
     *
     * @param  int $id
     * @return Response
     */
    public function destroy($id)
    {
        //
    }

    /**
     * @param Request $request
     * @param $pollId
     * @return \Illuminate\Database\Eloquent\Model|\Illuminate\Http\Response|null|static
     */
    public function submitVote(Request $request, $pollId)
    {
        Helpers::currentUserNoTempAllowed();

        PollVote::validate($request->only('poll_id', 'option'));

        $vote = PollVote::firstOrCreate($request->only('poll_id', 'option'));
        $poll = Poll::find($request->get('poll_id'));
        $vote->fresh();
        unset($vote->user_id);

        $this->webSockets->trigger($poll->chatroom_channel, 'client-vote', $vote->fresh(), Auth::user()->id);

        return response()->api($poll->fresh()->toArray());
    }
}