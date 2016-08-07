<?php namespace Finit;

use Auth;
use DB;
use Finit\Models\Friend;
use Finit\Models\User;
use PDO;

class FriendRepository {
    /**
     * @param $id
     * @return array
     */
    public static function getFriendIds($id)
    {
        $pdo = DB::connection()->getPdo();
        $sql = $pdo->prepare(
            '( SELECT `requester_id` FROM `friends` WHERE `accepter_id` = ? AND `status` = ? )' .
            'UNION ALL' .
            '( SELECT `accepter_id` FROM `friends` WHERE `requester_id` = ? AND `status` = ? )'
        );
        $sql->execute([$id, 2, $id, 2]);
        return $sql->fetchAll(PDO::FETCH_COLUMN);
    }

    /**
     * @param $id
     * @return array
     */
    public static function getRequesterIds($id)
    {
        return Friend::where('accepter_id', $id)
            ->where('status', 1)
            ->lists('requester_id')->all();
    }

    /**
     * Get friends and return only the user objects
     *
     * @param      $id
     * @return \Illuminate\Database\Eloquent\Collection|static[]
     */
    public static function getFriends($id)
    {
        $friendIds = self::getFriendIds($id, 2);
        if (!count($friendIds)) return [];

        return User::whereIn('id', $friendIds)->orderBy('username', 'asc')->get();
    }

    /**
     * Get current user's pending friend requests (received)
     *
     * @return \Illuminate\Database\Eloquent\Collection|static[]
     */
    public static function getFriendRequests($id)
    {
        return Friend
            ::where('accepter_id', $id)
            ->whereStatus(1)
            ->orderBy('created_at', 'des')
            ->with(['requester' => function ($q)
            {
                $q->addSelect(['id', 'username', 'picture_xs']);
            }])->get();
    }

    /**
     * Accept friendship
     * Upgrade status to 2
     *
     * @param $id
     * @return bool
     */
    public static function acceptRequest($id)
    {
        $friend = Friend::where('requester_id', $id)->where('accepter_id', Auth::user()->id)->first();

        $friend->status = 2;

        $friend->save();

        return $friend;
    }

    /**
     * Current user declines request
     *
     * @param $user_id
     * @throws \Exception
     */
    public static function declineRequest($user_id)
    {
        $friend = Friend::where('requester_id', $user_id)->where('accepter_id', Auth::user()->id)->first();

        $friend->delete();

        return $friend;
    }

    /**
     * Current user cancels request to another user
     *
     * @param $user_id
     * @return bool|null
     * @throws \Exception
     */
    public static function cancelRequest($user_id)
    {
        $friend = Friend::where('requester_id', Auth::user()->id)->where('accepter_id', $user_id)->first();

        if ($friend->status == 1)
            $friend->delete();

        return $friend;
    }

    /**
     * Query friendship then delete
     *
     * @param $user_id
     * @return bool|null
     * @throws \Exception
     */
    public static function removeFriend($user_id)
    {
        $friend = self::findFriendLink($user_id);

        $friend->delete();

        return $friend;
    }

    /**
     * Search by id's in both columns and reversed
     *
     * @param $user_id
     * @return \Illuminate\Database\Eloquent\Model|int|null|static
     */
    public static function findFriendLink($user_id)
    {
        $first = Friend::where('accepter_id', '=', $user_id)->where('requester_id', Auth::user()->id)->first();
        if ($first) return $first;

        $second = Friend::where('accepter_id', Auth::user()->id)->where('requester_id', '=', $user_id)->first();

        return $second;
    }

    /**
     * Get mutual friends of two users
     *
     * @param $currentUserId
     * @param $otherUserId
     * @return array
     */
    public static function getMutualFriends($currentUserId, $otherUserId)
    {
        // Get current users friend ids
        $friendIds = self::getFriendIds($currentUserId, 2);

        // If no friends, return
        if (!count($friendIds)) return [];

        // Remove otherUserId from array since we don't want to show user shown as mutual friend
        $friendIds = self::removeFromArray($friendIds, $otherUserId);

        // Find other users friends where id in (current users $friendIds array)
        $mutualFriendIds = self::findFriendsByIds($otherUserId, $friendIds);

        // If no mutual friends, return
        if (!count($mutualFriendIds)) return [];

        return User::whereIn('id', $mutualFriendIds)->orderBy('username', 'asc')->get();
    }

    /**
     * Check if two users are friends by Id
     *
     * @param $userA
     * @param $userB
     * @return bool
     */
    public static function areFriends($userA, $userB)
    {
        $first = Friend::where('accepter_id', '=', $userA)->where('requester_id', $userB)->pluck('id');
        if ($first) return true;

        $second = Friend::where('accepter_id', $userB)->where('requester_id', '=', $userA)->pluck('id');
        if ($second) return true;

        return false;
    }


    /**
     * @param       $userId
     * @param array $friendIds
     * @return array
     */
    private static function findFriendsByIds($userId, $friendIds = [])
    {
        $first = Friend::where('accepter_id', $userId)->where('status', 2)->whereIn('requester_id', $friendIds)->lists('requester_id')->all();
        $second = Friend::where('requester_id', $userId)->where('status', 2)->whereIn('accepter_id', $friendIds)->lists('accepter_id')->all();

        return array_merge($first, $second);
    }

    /**
     * Remove otherUserId from friendIds because we don't want
     * the shown user to show up as a mutual friend
     *
     * @param $friendIds
     * @param $otherUserId
     * @return mixed
     */
    private static function removeFromArray($friendIds, $otherUserId)
    {
        if (($key = array_search($otherUserId, $friendIds)) !== false)
        {
            array_splice($friendIds, $key, 1);

            return $friendIds;
        }

        return $friendIds;
    }

    /**
     * Filter user relations from Friend collection
     *
     * @param $friends
     * @return array
     */
    public static function filter($friends)
    {
        $filtered = [];

        foreach ($friends as $f)
        {
            $user = $f->getRelations();

            $filtered[] = isset($user['accepter']) ? $user['accepter'] : $user['requester'];
        }

        return $filtered;
    }
}