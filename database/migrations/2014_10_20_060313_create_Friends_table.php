<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateFriendsTable extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('friends', function (Blueprint $table)
        {
            $table->increments('id');
            $table->unsignedInteger('requester_id');
            $table->unsignedInteger('accepter_id');
            $table->tinyInteger('status');

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['requester_id', 'accepter_id']);
            $table->unique(['accepter_id', 'requester_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('friends');
    }

}
