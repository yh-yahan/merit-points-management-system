<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentExclusion extends Model
{
    protected $fillable = ['student_id'];

    public function student()
    {
        return $this->belongsTo(Students::class, 'student_id');
    }
}
