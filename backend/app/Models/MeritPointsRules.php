<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MeritPointsRules extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'points',
        'operation_type'
    ];

    public function transaction()
    {
        return $this->hasMany(Transaction::class, 'rule_id');
    }
}
