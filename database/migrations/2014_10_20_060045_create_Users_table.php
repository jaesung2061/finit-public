<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateUsersTable extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table)
        {
            $table->increments('id');
            $table->bigInteger('facebook_id');
            $table->string('email', 128)->unique();
            $table->string('fname', 32)->index();
            $table->string('lname', 32)->index();
            $table->string('full_name', 65)->index();
            $table->string('username', 32)->unique();
            $table->string('password', 255);
            $table->date('dob');
            $table->enum('gender', ['Male', 'Female']);
            $table->string('location', 64);
            $table->string('ip_based_location', 64);
            $table->string('website', 64);
            $table->text('bio');
            $table->string('picture_lg');
            $table->string('picture_md');
            $table->string('picture_sm');
            $table->string('picture_xs');
            $table->boolean('is_temp');
            $table->boolean('is_private');

            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });
        DB::statement('ALTER TABLE `users` CHANGE `email` `email` VARCHAR(128) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL;');
    }


    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('users');
    }

}
