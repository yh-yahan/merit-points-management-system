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
        Schema::create("invitation_codes", function(Blueprint $table){
          $table->id();
          $table->string('code')->unique();
          $table->string('for_user_type');
          $table->unsignedBigInteger('created_by');
          $table->date('valid_until');
          $table->timestamps();

          $table->foreign('created_by')
                ->references('id')
                ->on('admins')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
      Schema::dropIfExists('invitation_codes');
    }
};
