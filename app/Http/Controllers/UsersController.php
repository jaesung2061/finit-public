<?php namespace Finit\Http\Controllers;

use Auth;
use Dingo\Api\Http\Request;
use Finit\Helpers;
use Finit\Http\Requests;
use Finit\Models\EmailReset;
use Finit\Models\PasswordReset;
use Finit\Models\Photo;
use Finit\Models\User;
use Finit\WebSockets;
use JWTAuth;

class UsersController extends Controller {
    /**
     * @var WebSockets
     */
    private $webSockets;

    /**
     * UsersController constructor.
     *
     * @param WebSockets $webSockets
     */
    public function __construct(WebSockets $webSockets)
    {
        $this->middleware('jwt.auth', ['except' => [
            'index',
            'store',
            'show',
            'createTempAccount',
            'unsubscribeFromEmails'
        ]]);

        $this->webSockets = $webSockets;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $this->validate($request, ['param' => 'max:512']);

        $query = User::distinct()->whereIsTemp(0)->where('username', 'LIKE', "%{$request->get('param')}%");

        return response()->api($query->paginate(12)->toArray());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'email'    => 'required|email|unique:users,email|max:255',
            'username' => 'required|alpha_dash|max:20|ascii_only',
            'password' => 'required|between:6,255|confirmed',
        ], User::$validationMessages);

        $username = utf8_decode(html_entity_decode($request->get('username')));

//        if (strlen($username) != strlen($username))
//        {
//            Helpers::throwValidationException(['error' => ['Username cannot contain utf8 letters']]);
//        }

        /*DANGER, DELETE ACCOUNT, DON'T FUCK WITH THIS CONDITION*/
        // If there is a temp account using this username,
        // remove from mysql db and disconnect client
        // from ws server.
        // Reason for deleting, original account may not have been made by current user
        if ($user = User::whereUsername($username)->whereIsTemp(1)->first())
        {
            // send req to ws server to remove client
            $this->webSockets->command([
                'command'  => 'remove-client',
                'username' => $user->username,
                'data'     => ['reason' => 'username-taken']
            ]);

            $user->delete();
        }
        // If user is found that isn't temp, throw validation exception for unique username
        else if (User::whereUsername($username)->whereIsTemp(0)->first())
        {
            Helpers::throwValidationException(['username' => ['Username is already taken.']]);
        }

        $user = User::create($request->all());

        $token = JWTAuth::fromUser($user);

        return response()->api(compact('user', 'token'));
    }

    /**
     * Display the specified resource.
     *
     * @param  int $username
     * @return \Illuminate\Http\Response
     */
    public function show($username, Request $request)
    {
        $user = User::whereUsername($username)->first();

        if (!$user)
        {
            $user = User::whereId($request->get('userId'))->first();
        }

        return response()->api($user);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Dingo\Api\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     * @throws \Exception
     */
    public function update(Request $request, $id)
    {
        Helpers::currentUserNoTempAllowed();

        $user = User::find(Auth::user()->id);

        switch ($request->get('type'))
        {
            case 'profile':
                $this->validate($request, User::$validationRules, User::$validationMessages);
                $user->update($request->only(['website', 'bio']));

                return response()->api($user->fresh()->toArray());
            case 'privacy':
                $user->update(['is_private' => $request->get('privacy')]);

                return response()->api($user->fresh()->toArray());
            case 'email':
                EmailReset::validate($request);
                Auth::user()->update(['email' => $request->get('email_new')]);

                return response()->api('Good');
            case 'password':
                PasswordReset::validate($request);
                PasswordReset::sendResetEmail($request->only(['password_new']));

                return response()->api('Good');
            default:
                Helpers::throwValidationException(['type' => ['Type is required']]);
        }
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
        Helpers::currentUserNoTempAllowed();

        $user = User::find(Auth::user()->id);
        $file = $request->file('file');

        Photo::validate($file);
        $img = Photo::handleFile($file);
        Photo::uploadAndSave($img);
        unlink($img->dirname . '/' . $img->basename);

        return response()->api($user->fresh()->toArray());
    }

    /**
     * @param Request $request
     * @return mixed
     */
    public function createTempAccount(Request $request)
    {
        $this->validate($request, [
            'username' => 'required|alpha_dash|max:20|ascii_only'
        ]);
        $user = null;
        $username = $request->get('username');
        $attributes = [
            'is_temp'  => true,
            'username' => $username
        ];
        // Temp account found
        if ($prevUser = User::whereUsername($username)->whereIsTemp(1)->first())
        {
            // Search on ws server if client with this username is connected
            $wsClient = $this->webSockets->getClient([
                'username' => $username
            ]);
            // Username is not actively being used
            // Just make sure $prevUser is a temp account..
            if (!$wsClient && $prevUser->is_temp)
            {
                $prevUser->delete();
                $user = User::create($attributes);
            }
        }
        // Permanent account not found
        else if (User::whereUsername($username)->whereIsTemp(0)->first())
        {
            Helpers::throwValidationException(['username' => ['Username is taken.']]);
        }
        // None found
        else
        {
            $user = User::create($attributes);
        }

        $token = JWTAuth::fromUser($user);

        return response()->api(compact('user', 'token'));
    }

    /**
     * @param Request $request
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    function unsubscribeFromEmails(Request $request)
    {
        $user = User::whereEmail($request->get('email'))->first();

        if (!$user)
        {
            return response('Not found.', 404);
        }

        $user->subscribed = 0;
        $user->save();

        return response('good');
    }
}
