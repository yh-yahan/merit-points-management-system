<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Points extends Model
{
    use HasFactory;

    protected $fillable = [
      'receiver', 
      'total_points'
    ];

    public function student(){
      return $this->belongsTo(Students::class);
    }
}
