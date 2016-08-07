<?php

use Faker\Factory as Faker;
use Finit\Models\Friend;
use Finit\Models\User;
use Illuminate\Database\Seeder;

class FriendsTableSeeder extends Seeder {
    public function run()
    {
        $faker = Faker::create();
        $userIds = User::lists('id')->all();

        $iterations = (count($userIds) * count($userIds)) * 0.7;

        for ($i = 0; $i < $iterations; $i++)
        {
            echo $i / $iterations * 100 . "%\n";
            $userA = $faker->randomElement($userIds);
            $userB = $faker->randomElement($userIds);

            if ($userA == $userB)
            {
                continue;
            }

            if (Friend::where('requester_id', $userA)->where('accepter_id', $userB)->first() || Friend::where('accepter_id', $userA)->where('requester_id', $userB)->first())
            {
                continue;
            }

            $date = $faker->dateTimeThisYear($max = 'now');

            Friend::create([
                'requester_id' => $userA,
                'accepter_id'  => $userB,
                'status'       => $faker->numberBetween(1, 2),
                'created_at'   => $date,
                'updated_at'   => $date
            ]);
        }
    }
}
