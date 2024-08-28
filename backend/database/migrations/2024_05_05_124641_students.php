<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('students', function(Blueprint $table){
          $table->id();
          $table->string('name');
          $table->string('username');
          $table->string('email');
          $table->string('password');
          $table->string('class');
          $table->string('stream')->nullable();
          $table->string('status');
          $table->date('date_joined');
          $table->rememberToken();
          $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
      Schema::dropIfExists('students');
    }
};
