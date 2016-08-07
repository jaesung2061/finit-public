<?php

use Illuminate\Database\Migrations\Migration;

class AddTabTitleColumnToChatroomsTable extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('chatrooms', function ($table)
        {
            $table->string('tab_title')->after('image');
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
            $table->dropColumn('tab_title');
        });
    }
}
