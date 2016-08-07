<?php namespace Finit\Http\Controllers;

use Finit\Http\Requests;
use Finit\WebSockets;
use Illuminate\Http\Request;
use Response;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthenticateController extends Controller {
    /**
     * @var WebSockets
     */
    private $webSockets;

    /**
     * AuthenticateController constructor.
     *
     * @param WebSockets $webSockets
     */
    public function __construct(WebSockets $webSockets)
    {
        $this->webSockets = $webSockets;
        $this->middleware('api.throttle', [
            'only'    => ['login'],
            'limit'   => 10,
            'expires' => 10
        ]);
    }

    /**
     * Verify token
     *
     * @return Response
     */
    public function verifyToken()
    {
        $user = JWTAuth::parseToken()->authenticate();

        if ($user->is_temp)
        {
            $wsClient = $this->webSockets->getClient(['username' => $user->username]);

            if ($wsClient)
            {
                return response()->error(['username' => ['Username taken.']], 422);
            }
        }

        // Update IP address
        $user->ip = \Request::ip();
        $user->save();
        unset($user->ip);

        $token = JWTAuth::getToken()->get()->get();

        $this->loadUserRelations($user);

        return response(compact('token', 'user'));
    }

    /**
     * Login user with credentials
     *
     * @param Request $request
     * @return Response
     */
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');
        $remember = $request->only('remember');

        try
        {
            if (!$token = JWTAuth::attempt($credentials))
            {
                return response(['error' => 'invalid_credentials'], 401);
            }
        }
        catch (JWTException $e)
        {
            return response($e->getTrace(), 500);
        }

        $user = JWTAuth::toUser($token);

        // Update IP address
        $user->ip = \Request::ip();
        $user->save();
        unset($user->ip);

        $this->loadUserRelations($user);

        return response(compact('token', 'user', 'remember'));
    }

    /**
     * Log out user. Blacklist the token.
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy()
    {
        JWTAuth::invalidate(JWTAuth::getToken());

        return Response::make('Good', 200);
    }

    /**
     * @param $user
     */
    private function loadUserRelations($user)
    {
        $user->loadMutes()->loadRegularTags()->load('chatroom');
    }
}
