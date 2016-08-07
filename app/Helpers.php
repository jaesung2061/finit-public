<?php namespace Finit;

use Auth;
use Finit\Models\User;
use Guzzle\Service\Exception\ValidationException;
use SimpleXMLElement;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class Helpers {
    /**
     * Throw exception to be caught by handler
     *
     * @param $errors
     */
    public static function throwValidationException($errors)
    {
        $exception = new ValidationException('Invalid input', 422);
        $exception->setErrors($errors);
        throw $exception;
    }

    /**
     * This will be used to guard routes that require the user to have
     * a non-temp account.
     *
     * @param $otherUser
     */
    public static function noTempAccounts($otherUser)
    {
        static::currentUserNoTempAllowed();
        static::otherUserNoTempAllowed($otherUser);
    }

    /**
     * @param $otherUser
     */
    public static function otherUserNoTempAllowed($otherUser)
    {
        $isTemp = null;

        if (!is_object($otherUser))
        {
            $isTemp = User::whereId($otherUser)->value('is_temp');
        }
        else
        {
            $isTemp = $otherUser->is_temp;
        }

        if ($isTemp) {
            throw new AccessDeniedHttpException;
        }
    }

    /**
     *
     */
    public static function currentUserNoTempAllowed()
    {
        if (Auth::user() && Auth::user()->is_temp) {
            throw new AccessDeniedHttpException;
        }
    }

    /**
     * @param array $arr
     * @param SimpleXMLElement $xml
     * @return SimpleXMLElement
     */
    public static function array_to_xml(array $arr, SimpleXMLElement $xml)
    {
        foreach ($arr as $k => $v) {
            is_array($v)
                ? static::array_to_xml($v, $xml->addChild($k))
                : $xml->addChild($k, $v);
        }
        return $xml;
    }
}