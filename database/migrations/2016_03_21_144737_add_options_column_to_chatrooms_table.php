<?php

use Illuminate\Database\Migrations\Migration;

class AddOptionsColumnToChatroomsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('chatrooms', function ($table)
        {
            $table->string('settings', 2048);
        });
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
            $table->dropColumn('settings');
        });
    }
}
