<?php

// Composer: "fzaninotto/faker": "v1.3.0"
use Faker\Factory as Faker;
use Finit\Models\Chat\Favorite;
use Finit\Models\Chat\Poll;
use Finit\Models\User;
use Illuminate\Database\Seeder;

class PollsTableSeeder extends Seeder {

    public function run()
    {
        $faker = Faker::create();
        $channels = Favorite::where('user_id', 1)->lists('channel')->toArray();
        $userIds = User::lists('id')->toArray();

        foreach (range(1, 200) as $index)
        {
            $options = [];
            $times = $faker->numberBetween(2, 5);

            for ($i = 1; $i <= $times; $i++)
            {
                $options[] = str_replace(["'", '"'], '', $faker->sentence);
            }

            $attributes = [
                'user_id'          => $faker->randomElement($userIds),
                'chatroom_channel' => $faker->randomElement($channels),
                'question'         => str_replace(["'", '"'], '', $faker->sentence) . '?',
                'options'          => json_encode($options)
            ];
            Poll::create($attributes);
        }
    }

}