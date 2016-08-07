<?php

use Illuminate\Database\Migrations\Migration;

class AddMessageIdColumnToPhotosTable extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('photos', function ($table)
        {
            $table->unsignedInteger('message_id')->after('box_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('photos', function ($table)
        {
            $table->dropColumn('message_id');
        });
    }
}
