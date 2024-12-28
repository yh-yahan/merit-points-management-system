<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PointsThreshold extends Model
{
    use HasFactory;

    protected $fillable = [
        'points', 
        'operation_type', 
        'actions', 
    ];
    protected $table = 'points_threshold';
}
