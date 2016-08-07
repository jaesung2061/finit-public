<?php

// Composer: "fzaninotto/faker": "v1.3.0"
use Faker\Factory as Faker;
use Finit\Models\User;
use Guzzle\Service\Exception\ValidationException;
use Illuminate\Database\Seeder;
use Mockery\CountValidator\Exception;

class UsersTableSeeder extends Seeder {
    public function run()
    {
        $faker = Faker::create();
        $users = [];

        $users[0] = User::create([
            'fname'      => 'Jeff',
            'lname'      => 'Yeon',
            'username'   => 'JeffYeon2061',
            'email'      => 'jeffyeon2061@yahoo.com',
            'password'   => 'secret',
            'dob'        => '1991-09-24',
            'gender'     => 'Male',
            'location'   => 'California',
            'website'    => 'www.foobar.com',
            'bio'        => $faker->paragraph(4),
            'picture_lg' => 'images/avatar-male.jpg',
            'picture_md' => 'images/avatar-male.jpg',
            'picture_sm' => 'images/avatar-male.jpg',
            'picture_xs' => 'images/avatar-male.jpg',
            'is_private' => false
        ]);
        $users[1] = User::create([
            'fname'      => 'Jane',
            'lname'      => 'Doe',
            'username'   => 'JaneDoe',
            'email'      => 'jane@doe.com',
            'password'   => 'secret',
            'dob'        => '1991-09-24',
            'gender'     => 'Female',
            'location'   => 'California',
            'website'    => 'www.foobar.com',
            'bio'        => $faker->paragraph(4),
            'picture_lg' => 'images/avatar-female.jpg',
            'picture_md' => 'images/avatar-female.jpg',
            'picture_sm' => 'images/avatar-female.jpg',
            'picture_xs' => 'images/avatar-female.jpg',
            'is_private' => false
        ]);
        $users[2] = User::create([
            'fname'      => 'John',
            'lname'      => 'Doe',
            'username'   => 'JohnDoe',
            'email'      => 'john@doe.com',
            'password'   => 'secret',
            'dob'        => '1991-09-24',
            'gender'     => 'Male',
            'location'   => 'California',
            'website'    => 'www.foobar.com',
            'bio'        => $faker->paragraph(4),
            'picture_lg' => 'images/avatar-male.jpg',
            'picture_md' => 'images/avatar-male.jpg',
            'picture_sm' => 'images/avatar-male.jpg',
            'picture_xs' => 'images/avatar-male.jpg',
            'is_private' => true
        ]);

        foreach (range(1, 50) as $i)
        {
            $fname = str_replace('\'', '', $faker->firstName);
            $lname = str_replace('\'', '', $faker->lastName);
            $randomPicture = $faker->randomElement(['images/avatar-female.jpg', 'images/avatar-male.jpg']);

            try
            {
                try
                {
                    User::create([
                        'fname'      => $fname,
                        'lname'      => $lname,
                        'username'   => str_replace('\'', '', $faker->lastName) . $faker->numberBetween(1, 9999),
                        'email'      => implode([$faker->email, $faker->numberBetween(100, 9999)]),
                        'password'   => 'secret',
                        'dob'        => $faker->dateTime->format('Y-m-d'),
                        'gender'     => $faker->randomElement(['Male', 'Female']),
                        'location'   => $faker->city,
                        'website'    => $faker->domainName,
                        'bio'        => $faker->paragraph(4),
                        'picture_lg' => $randomPicture,
                        'picture_md' => $randomPicture,
                        'picture_sm' => $randomPicture,
                        'picture_xs' => $randomPicture,
                        'created_at' => $faker->dateTimeThisYear($max = 'now')->format('Y-m-d'),
                        'updated_at' => $faker->dateTimeThisYear($max = 'now')->format('Y-m-d'),
                        'is_private' => $faker->boolean
                    ]);
                }
                catch (Exception $e)
                {
                    continue;
                }
            }
            catch (ValidationException $e)
            {
                continue;
            }
        }
    }
}