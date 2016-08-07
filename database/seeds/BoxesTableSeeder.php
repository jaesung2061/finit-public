<?php

// Composer: "fzaninotto/faker": "v1.3.0"
use Faker\Factory as Faker;
use Finit\Models\Box;
use Finit\Models\User;
use Illuminate\Database\Seeder;

class BoxesTableSeeder extends Seeder {
    public function run()
    {
        $faker = Faker::create();

        $userIds = User::lists('id')->all();
        $colors = ['grey', 'red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber', 'orange', 'deep-orange', 'brown', 'blue-grey'];

        foreach (range(1, 100) as $index)
        {
            $width = (int)($faker->randomElement([1, 2]));
            $height = (int)($faker->randomElement([1, 2]));
            $color = $faker->randomElement($colors);

            if ($width + $height == 2)
                $max = 5;
            else if ($width + $height == 3)
                $max = 10;
            else
                $max = 20;

            $dateTime = $faker->dateTimeThisMonth;

            Box::create([
                'giver_id'   => $faker->randomElement($userIds),
                'taker_id'   => 1,
                'body'       => $faker->paragraph($faker->numberBetween(3, $max)),
                'width'      => $width,
                'height'     => $height,
                'color'      => $color,
                'created_at' => $dateTime,
                'updated_at' => $dateTime,
            ]);
        }
    }
}