<?php

// Composer: "fzaninotto/faker": "v1.3.0"
use Faker\Factory as Faker;
use Finit\Models\Chat\Favorite;
use Illuminate\Database\Seeder;

class FavoritesTableSeeder extends Seeder {

    public function run()
    {
        $faker = Faker::create();

        foreach (range(1, 5) as $index)
        {
            $company = str_replace([' ', '"', ',', '-'], '', $faker->company);

            Favorite::create([
                'suffix'  => $company,
                'title'   => $company,
                'user_id' => 1,
                'channel' => 'pub_' . $company
            ]);
            Favorite::create([
                'suffix'  => $company,
                'title'   => $company,
                'user_id' => 2,
                'channel' => 'pub_' . $company
            ]);
            Favorite::create([
                'suffix'  => $company,
                'title'   => $company,
                'user_id' => 3,
                'channel' => 'pub_' . $company
            ]);
        }
    }
}