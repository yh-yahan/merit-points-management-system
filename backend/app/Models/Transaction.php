<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class transaction extends Model
{
    use HasFactory;

    public function creator(){
      return $this->morphTo();
    }

    public function student(){
      return $this->belongsTo(Students::class, 'receiver_id');
    }

    public function meritPointRule(){
      return $this->belongsTo(MeritPointRules::class, 'id');
    }
}
