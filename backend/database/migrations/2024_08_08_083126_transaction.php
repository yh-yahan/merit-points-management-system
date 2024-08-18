<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transaction', function(Blueprint $table){
          $table->id();
          $table->unsignedBigInteger('created_by_id');
          $table->string('created_by_type');
          $table->unsignedBigInteger('receiver_id')->nullable();
          $table->unsignedBigInteger('rule_id')->nullable();
          $table->foreign('receiver_id')
                ->references('id')
                ->on('students')
                ->onDelete('set null');
          $table->foreign('rule_id')
                ->references('id')
                ->on('merit_points_rules')
                ->onDelete('set null');
          $table->text('description');
          $table->integer('points');
          $table->enum('operation_type', ["add", "deduct"]);
          $table->date('date');
          $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
      Schema::dropIfExists('transaction');
    }
};
