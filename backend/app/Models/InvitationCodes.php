<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvitationCodes extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'for_user_type',
        'created_by',
        'valid_until'
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }
}
