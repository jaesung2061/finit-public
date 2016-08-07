<?php namespace Finit\Exceptions;

use Exception;
use Guzzle\Service\Exception\ValidationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;

class Handler extends ExceptionHandler {
    /**
     * A list of the exception types that should not be reported.
     *
     * @var array
     */
    protected $dontReport = [
        'Symfony\Component\HttpKernel\Exception\HttpException',
    ];

    /**
     * Report or log an exception.
     *
     * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
     *
     * @param  \Exception $e
     * @return void
     */
    public function report(Exception $e)
    {
        return parent::report($e);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Exception $e
     * @return \Illuminate\Http\Response
     */
    public function render($request, Exception $e)
    {
        if ($e instanceof ValidationException)
        {
            return response()->json($e->getErrors(), 422);
        }
        else if ($e instanceof TokenExpiredException)
        {
            return response()->json(['error' => 'Token expired'], 400);
        }

//        $this->handler->register(function (ValidationException $e) {
//            return response()->json($e->getErrors(), 422);
//        });
//        $this->handler->register(function (TokenExpiredException $e) {
//        });

        return parent::render($request, $e);
    }
}
