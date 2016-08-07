<?php namespace Finit\Http\Controllers;

use Dingo\Api\Exception\ValidationHttpException;
use Dingo\Api\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesCommands;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Facades\JWTAuth;

abstract class Controller extends BaseController {
    use AuthorizesRequests, DispatchesCommands, ValidatesRequests;

    public function validate(Request $request, array $rules, array $messages = [], array $customAttributes = [])
    {
        $validator = $this->getValidationFactory()->make($request->all(), $rules, $messages, $customAttributes);

        if ($validator->fails())
        {
            throw new ValidationHttpException($validator->errors());
        }
    }

    /**
     * For use when only a certain part of a method
     * needs authentication
     *
     * @return array
     */
    public function authenticateUser()
    {
        $user = JWTAuth::parseToken()->authenticate();

        if (!$user) throw new TokenExpiredException;

        return compact('user');
    }

    /**
     * @return array
     * @throws TokenExpiredException
     */
    public function optionalAuthenticate()
    {
        $user = JWTAuth::parseToken()->authenticate();

        return compact('user');
    }
}
