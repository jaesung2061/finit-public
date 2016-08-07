<?php

// Composer: "fzaninotto/faker": "v1.3.0"
use Faker\Factory as Faker;
use Finit\Models\Chat\Poll;
use Finit\Models\Chat\PollVote;
use Finit\Models\User;
use Illuminate\Database\Seeder;

class PollVotesTableSeeder extends Seeder {

    public function run()
    {
        $faker = Faker::create();
        $pollIds = Poll::lists('id')->toArray();
        $userIds = User::lists('id')->toArray();

        foreach (range(1, count($pollIds) * 50) as $index)
        {
            $poll = Poll::find($faker->randomElement($pollIds));

            PollVote::firstOrCreate([
                'user_id' => $faker->randomElement($userIds),
                'poll_id' => $poll->id,
                'option'  => $faker->numberBetween(1, count(json_decode($poll->options)))
            ]);
        }
    }

}