<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateNotificationsTable extends Migration {

    public function up()
    {
        Schema::create('notifications', function (Blueprint $table)
        {
            $table->increments('id');
            $table->unsignedInteger('user_id');
            $table->tinyInteger('event');
            $table->unsignedInteger('source_id');
            $table->string('data', 4096);
            $table->boolean('is_read');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::drop('notifications');
    }

}
