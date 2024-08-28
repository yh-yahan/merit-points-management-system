<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $table = 'transaction';

    protected $fillable = [
      'created_by_id', 
      'created_by_type', 
      'receiver_id', 
      'rule_id',
      'description', 
      'points', 
      'operation_type', 
      'date'
    ];

    public function creator(){
      return $this->morphTo();
    }

    public function student(){
      return $this->belongsTo(Students::class, 'receiver_id');
    }

    public function meritPointRule(){
      return $this->belongsTo(MeritPointsRules::class, 'rule_id');
    }
}
