<?php namespace Finit\Http\Controllers;

use App;
use Finit\IpBan;
use Finit\Models\Chat\Chatroom;
use Finit\Models\Notification;
use JavaScript;
use Jenssegers\Agent\Facades\Agent;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class AngularController extends Controller {
    /**
     * Serve the application
     *
     * @return \Illuminate\View\View
     */
    public function serveApp()
    {
        $this->filterIpBans();
        $this->setJavaScriptVariables();
        $version = $this->setCacheBreak();
        $chatroom = $this->queryChatroom();

        return view('index', compact('version', 'chatroom'));
    }

    /**
     * @return mixed
     */
    public function siteMapData()
    {
        $chatrooms = Chatroom
            ::where('description_short', '<>', '')
            ->where('tab_title', '<>', '')
            ->get();

        foreach ($chatrooms as $chatroom)
        {
            $chatroom->description_short .= ' | Find a #hashtag of whatever you love - music, sports, games - and join the party. Add friends, invite them to your favorite #hashtags and enjoy or host private chat rooms within your social network.';
        }

        return response()->api($chatrooms);
    }

    /**
     * @return mixed
     */
    public function siteMapXml()
    {
        $chatrooms = Chatroom
            ::where('description_short', '<>', '')
            ->where('tab_title', '<>', '')
            ->get();

        foreach ($chatrooms as $chatroom)
        {
            $chatroom->description_short .= ' | Find a #hashtag of whatever you love - music, sports, games - and join the party. Add friends, invite them to your favorite #hashtags and enjoy or host private chat rooms within your social network.';
        }

        $content = view('site-map', compact('chatrooms'));

        return response($content)->header('Content-Type', 'text/xml');
    }

    /**
     * Show unsupported page if user's browser is unsupported
     *
     * @return \Illuminate\View\View
     */
    public function unsupported()
    {
        return view('unsupported_browser');
    }

    /**
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    public function pingTest()
    {
        global $start;

        return response(microtime(true) - $start);
    }

    /**
     *
     */
    private function filterIpBans()
    {
        if (IpBan::whereIp(\Request::ip())->first())
        {
            throw new AccessDeniedHttpException();
        }
    }

    /**
     * @return mixed
     */
    private function setJavaScriptVariables()
    {
        $variables = [
            'ws'            => [
                'protocol' => env('WEBSOCKET_CONNECTION_PROTOCOL'),
                'url'      => env('WEBSOCKET_CONNECTION_URL'),
            ],
            'app_keys'      => [
                'facebook'    => env('FACEBOOK_APP_ID'),
                'shareaholic' => env('SHAREAHOLIC_API_KEY'),
            ],
            'agent'         => [
                'isIpad'   => Agent::is('iPad'),
                'isIphone' => Agent::is('iPhone'),
                'isMobile' => Agent::isMobile(),
                'isSafari' => Agent::isSafari()
            ],
            'version'       => env('APP_VERSION') ?: time(),
            'environment'   => env('APP_ENV'),
            'notifications' => Notification::getConstants(),
            'chatroom'     => $this->queryChatroom()
        ];

        if (env('APP_ENV') === 'local' && Agent::isMobile())
            $variables['ws']['url'] = '192.168.1.64:8081';

        JavaScript::put($variables);
    }

    /**
     * For breaking cache
     *
     * @return int
     */
    private function setCacheBreak()
    {
        $lastUpdated = file_get_contents(base_path('lastupdated.txt'), 'r');
        $version = $lastUpdated ?: time();

        return $version;
    }

    /**
     * @return mixed
     */
    private function queryChatroom()
    {
        $chatroom = null;

        if (App::isLocal())
            $pattern = '/^http:\/\/finit2\.app:8000\/chat\/[a-zA-Z0-9]+/';
        else
            $pattern = '/^https:\/\/(www\.)?finit\.co\/chat\/[a-zA-Z0-9]+/';

        if (preg_match($pattern, \Request::url()))
        {
            $url = parse_url(\Request::url());

            $components = explode('/', $url['path']);

            $chatroom = Chatroom::whereChannel('pub_' . strtolower($components[2]))->first();
        }

        return $chatroom;
    }
}
