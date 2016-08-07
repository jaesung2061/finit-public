<?php

// Composer: "fzaninotto/faker": "v1.3.0"
use Faker\Factory as Faker;
use Finit\Models\Notification;
use Illuminate\Database\Seeder;

class NotificationsTableSeeder extends Seeder {

    public function run()
    {
        $faker = Faker::create();

        foreach (range(1, 200) as $index)
        {
            $event = $faker->randomElement([1, 2, 5, 6, 7, 8, 9, 10, 11, 12]);
            $data = null;

            if ($event == Notification::CHAT_INVITE_PUBLIC_RECEIVED)
            {
                $suffix = str_replace(' ', '', $faker->streetName);
                $data = json_encode([
                    'chatroom_suffix'  => $suffix,
                    'chatroom_title'   => '#' . $suffix,
                    'chatroom_channel' => 'pub_' . $suffix
                ]);
            }

            $dateTime = $faker->dateTimeThisYear;

            Notification::create([
                'user_id'    => 1,
                'event'      => $event,
                'source_id'  => $faker->numberBetween(2, 100),
                'data'       => $data,
                'created_at' => $dateTime,
                'updated_at' => $dateTime
            ]);
        }
    }
}