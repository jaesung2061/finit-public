<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateBoxesTable extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('boxes', function (Blueprint $table)
        {
            $table->increments('id');
            $table->unsignedInteger('giver_id');
            $table->unsignedInteger('taker_id');
            $table->unsignedInteger('photo_id');
            $table->enum('width', [1, 2]);
            $table->enum('height', [1, 2]);
            $table->enum('color', [
                'grey', 'red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber', 'orange', 'deep-orange', 'brown', 'blue-grey'
            ]);
            $table->string('class');
            $table->text('body');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('boxes');
    }

}
