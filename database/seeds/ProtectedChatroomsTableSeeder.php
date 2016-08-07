<?php

// Composer: "fzaninotto/faker": "v1.3.0"
use Faker\Factory as Faker;
use Finit\Models\Chat\ProtectedChatroom;
use Finit\Models\User;
use Illuminate\Database\Seeder;

class ProtectedChatroomsTableSeeder extends Seeder {

    public function run()
    {
        $faker = Faker::create();
        $userIds = User::lists('id')->all();

        foreach (range(1, count($userIds) * 10) as $index)
        {
            ProtectedChatroom::create([
                'title'        => $faker->firstName,
                'suffix'       => $faker->firstName,
                'user_id'      => $faker->randomElement($userIds),
                'access_level' => $faker->randomElement(['invite', 'friends', 'friendsOfFriends'])
            ]);
        }
    }

}