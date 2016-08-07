<?php namespace Finit;

use Finit\Models\Notification;
use GuzzleHttp\Client;

class WebSockets {
    /**
     * @var Client
     */
    private $guzzle;
    /**
     * @var string
     */
    private $apiUrl;
    /**
     * @var array
     */
    private $apiHeaders;

    /**
     * @param Client $client
     */
    public function __construct(Client $client)
    {
        $this->guzzle = $client;
        $this->apiUrl = env('WEBSOCKET_API_PROTOCOL') . env('WEBSOCKET_API_URL');
        $this->apiHeaders = [
            'Content-type' => 'application/json',
            'X-Secret-Key' => env('WEBSOCKET_API_SECRET')
        ];
    }

    /**
     * @param $channel
     * @param $event
     * @param $data
     * @param null $sender_id
     */
    public function trigger($channel, $event, $data, $sender_id = null)
    {
        $data = [
            'event'     => $event,
            'channel'   => $channel,
            'data'      => $data,
            'sender_id' => $sender_id
        ];

        $this->guzzle->post($this->apiUrl . '/trigger', [
            'headers' => $this->apiHeaders,
            'body'    => json_encode($data)
        ]);
    }

    /**
     * @param Notification $notification
     */
    public function notify(Notification $notification)
    {
        $data = [
            'event' => 'notification',
            'data'  => $notification
        ];

        $this->guzzle->post($this->apiUrl . '/notify', [
            'headers' => $this->apiHeaders,
            'body'    => json_encode($data)
        ]);
    }

    /**
     * @param $channels
     * @return array
     */
    public function getChannels($channels = [])
    {
        $requestUrl = $this->apiUrl . '/channels';

        if (count($channels) > 0)
        {
            $queryString = http_build_query($channels);
            $queryString = preg_replace('/%5B[0-9]+%5D/simU', '%5B%5D', $queryString);
            $requestUrl .= '?' . $queryString;
        }

        $response = $this->guzzle->get($requestUrl, [
            'headers' => $this->apiHeaders
        ]);

        return json_decode((string)$response->getBody());
    }

    /**
     * @param array $data
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function getClient(array $data)
    {
        $res = $this->guzzle->get($this->apiUrl . '/users', [
            'headers' => $this->apiHeaders,
            'body'    => json_encode($data)
        ]);

        return json_decode($res->getBody());
    }

    /**
     * @param $data
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function command($data)
    {
        return $this->guzzle->post($this->apiUrl . '/command', [
            'headers' => $this->apiHeaders,
            'body'    => json_encode($data)
        ]);
    }

    /**
     * @param $channel
     * @param $data
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function updateChatroomState($data)
    {
        return $this->guzzle->post($this->apiUrl . '/updateChatroomState', [
            'headers' => $this->apiHeaders,
            'body'    => json_encode($data)
        ]);
    }

    /**
     * @param $data
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function updateUserState($data)
    {
        return $this->guzzle->post($this->apiUrl . '/updateUserState', [
            'headers' => $this->apiHeaders,
            'body'    => json_encode($data)
        ]);
    }
}
