<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StudentSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'opt_out_lb',
        'name_preference_lb',
    ];

    public function student()
    {
        return $this->belongsTo(Students::class);
    }
}
