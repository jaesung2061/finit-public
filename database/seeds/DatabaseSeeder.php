<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder {

    public function __construct()
    {
        if (!App::isLocal())
        {
            throw new Exception('DO NOT SEED IN PRODUCTION');
        }
    }

    /**
     * $table => $seeder
     *
     * @var array
     */
    protected $seeders = [
//        'users'         => UsersTableSeeder::class,
//        'friends'       => FriendsTableSeeder::class,
//        'favorites'     => FavoritesTableSeeder::class,
//        'chat_messages' => MessagesTableSeeder::class,
//        'boxes'         => BoxesTableSeeder::class,
//        'notifications' => NotificationsTableSeeder::class,
//        'comments'      => CommentsTableSeeder::class,
//        'likes'         => LikesTableSeeder::class,
        'polls'         => PollsTableSeeder::class,
        'poll_votes'    => PollVotesTableSeeder::class,
    ];

    public function run()
    {
        Model::unguard();
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        foreach ($this->seeders as $table => $seeder)
        {
            DB::table($table)->truncate();
            $this->call($seeder);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
        Model::reguard();
    }
}
