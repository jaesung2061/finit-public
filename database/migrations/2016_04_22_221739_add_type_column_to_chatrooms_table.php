<?php

use Finit\Models\Chat\Chatroom;
use Illuminate\Database\Migrations\Migration;

class AddTypeColumnToChatroomsTable extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('chatrooms', function ($table)
        {
            $table->string('type')->after('channel');
        });
        Chatroom::where('channel', 'LIKE', 'pub_%')->update(['type' => 'public']);
        Chatroom::where('channel', 'LIKE', 'pro_%')->update(['type' => 'protected']);
        Chatroom::where('channel', 'LIKE', 'prv_%')->update(['type' => 'private']);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('chatrooms', function ($table)
        {
            $table->dropColumn('type');
        });
    }
}
