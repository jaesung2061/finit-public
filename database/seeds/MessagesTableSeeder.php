<?php

// Composer: "fzaninotto/faker": "v1.3.0"
use Faker\Factory as Faker;
use Finit\Models\Chat\Favorite;
use Finit\Models\Chat\Message;
use Finit\Models\User;
use Illuminate\Database\Seeder;

class MessagesTableSeeder extends Seeder {
    public function run()
    {
        $faker = Faker::create();
        $channels = Favorite::lists('channel')->all();
        $userIds = User::lists('id')->all();

        array_push($channels, 'random');

        foreach (range(1, 1000) as $index)
        {
            Message::create([
                'channel'    => $faker->randomElement($channels),
                'sender_id'  => $faker->randomElement($userIds),
                'body'       => $faker->sentence($faker->randomDigitNotNull),
                'created_at' => $date = $faker->dateTimeThisMonth,
                'updated_at' => $date,
            ]);
        }
    }
}