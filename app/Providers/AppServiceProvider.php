<?php namespace Finit\Providers;

use App;
use Exception;
use Illuminate\Support\ServiceProvider;
use Validator;

class AppServiceProvider extends ServiceProvider {
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Validator::extend('ascii_only', function ($attribute, $value, $parameters)
        {
            $value = str_replace(['-', '_'], '', $value);
            return !preg_match('/[^x00-x7F]/i', $value);
        });

        app('Dingo\Api\Exception\Handler')->register(function (Exception $e)
        {
            if ($e instanceof \Dingo\Api\Exception\ValidationHttpException)
                return response($e->getErrors(), $e->getStatusCode());
            if ($e instanceof \Guzzle\Service\Exception\ValidationException)
                return response($e->getErrors(), 422);
            if (method_exists($e, 'getStatusCode'))
                return response($e->getMessage(), $e->getStatusCode());

            if (!App::isLocal())
            {
                return response('Something went wrong!', 500);
            }

            return response([
                'message' => $e->getMessage(),
                'code'    => $e->getCode(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
                'trace'   => $e->getTrace(),
            ], 500);
        });
    }

    /**
     * Register any application services.
     *
     * This service provider is a great spot to register your various container
     * bindings with the application. As you can see, we are registering our
     * "Registrar" implementation here. You can add your own bindings too!
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(
            'Illuminate\Contracts\Auth\Registrar',
            'Finit\Services\Registrar'
        );
    }
}
