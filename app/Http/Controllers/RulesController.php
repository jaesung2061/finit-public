<?php namespace Finit\Http\Controllers;

use Auth;
use Dingo\Api\Http\Request;
use Finit\Http\Requests;
use Finit\Models\Rule;
use Finit\Models\User;

class RulesController extends Controller {
    /**
     * RulesController constructor.
     */
    public function __construct()
    {
        //
    }

    /**
     * @param Request $request
     * @return mixed
     */
    public function index(Request $request)
    {
        $input = $request->only(['user_id', 'type', 'source_id', 'channel']);
        $q = Rule::query();

        foreach ($input as $column => $value)
        {
            if ($value) $q->where($column, $value);
        }

        return response()->api($q->with('user')->get()->toArray());
    }

    /**
     * @param Request $request
     * @return mixed
     * @throws \Exception
     */
    public function store(Request $request)
    {
        $this->authorizeRequest($request);

        $user = User::whereUsername($request->get('bannedUserUsername'))->first();

        if (Auth::user() && $user->username === Auth::user()->username)
        {
            return response(['username' => ['Cannot ban yourself.']]);
        }

        if ($user)
        {
            $rule = Rule::firstOrCreate([
                'user_id'   => $user->id,
                'source_id' => $request->get('source_id') || Auth::user()->id,
                'type'      => $request->get('type'),
                'channel'   => $request->get('channel')
            ]);

            $rule->load('user');
            return response()->api($rule->toArray());
        }

        return response('Couldn\'t find user', 404);
    }

    /**
     * @param $id
     */
    public function show($id)
    {
        //
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
     * @param $id
     * @param Request $request
     * @throws \Exception
     */
    public function destroy($id, Request $request)
    {
        $this->authorizeRequest($request);
        $rule = null;

        if ($id)
        {
            $rule = Rule::whereId($id)->whereChannel($request->get('channel'))->first();
        }

        if (!$rule)
        {
            $bannedUserId = User::whereUsername($request->get('bannedUserUsername'))->value('id');

            $rule = Rule::where('user_id', $bannedUserId)->where('type', $request->get('type'))
                ->where('channel', $request->get('channel'))->first();
        }

        if ($rule)
        {
            $rule->delete();
        }

        return response()->api('good');
    }

    /**
     * @param $request
     * @throws \Exception
     */
    private function authorizeRequest($request)
    {
        if ($request->get('secret'))
        {
            if ($request->get('secret') != env('WEBSOCKET_API_SECRET'))
            {
                throw new \Exception('Forbidden', 403);
            }
        }
        else
        {
            $this->authenticateUser();

            if (!Auth::user()->isModFor($request->get('channel')))
            {
                throw new \Exception('Forbidden', 403);
            }
        }
    }
}
