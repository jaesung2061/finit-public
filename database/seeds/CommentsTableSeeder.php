<?php

// Composer: "fzaninotto/faker": "v1.3.0"
use Faker\Factory as Faker;
use Finit\Models\Box;
use Finit\Models\Comment;
use Finit\Models\User;
use Illuminate\Database\Seeder;

class CommentsTableSeeder extends Seeder {

    public function run()
    {
        $faker = Faker::create();
        $userIds = User::lists('id')->all();
        $boxIds = Box::lists('id')->all();

        foreach (range(1, 150) as $index)
        {
            Comment::create([
                'box_id'     => $faker->randomElement($boxIds),
                'giver_id'   => $faker->randomElement($userIds),
                'body'       => $faker->sentence($faker->randomDigitNotNull),
                'created_at' => $date = $faker->dateTimeThisMonth,
                'updated_at' => $date
            ]);
        }
    }

}