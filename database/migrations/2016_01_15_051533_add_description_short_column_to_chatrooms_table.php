<?php

use Illuminate\Database\Migrations\Migration;

class AddDescriptionShortColumnToChatroomsTable extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('chatrooms', function ($table)
        {
            $table->string('description_short')->after('image');
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
            $table->dropColumn('description_short');
        });
    }
}
