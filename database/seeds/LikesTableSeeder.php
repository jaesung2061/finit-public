<?php

// Composer: "fzaninotto/faker": "v1.3.0"
use Faker\Factory as Faker;
use Finit\Models\Box;
use Finit\Models\Chat\Message;
use Finit\Models\Like;
use Finit\Models\User;
use Illuminate\Database\Seeder;

class LikesTableSeeder extends Seeder {

    public function run()
    {
        $faker = Faker::create();
        $maxNum = Box::count() > Message::count() ? Box::count() : Message::count();
        $userIds = User::lists('id')->all();
        $columns = ['box', 'message'];

        foreach (range(1, 10000) as $index)
        {
            Like::create([
                $faker->randomElement($columns) . '_id' => $faker->numberBetween(1, $maxNum),
                'user_id'                               => $faker->randomElement($userIds),
            ]);
        }
    }

}