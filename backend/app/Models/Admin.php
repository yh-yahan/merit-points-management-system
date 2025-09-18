<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Admin extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    use HasFactory;

    public function invitationCodes()
    {
        return $this->hasMany(InvitationCodes::class, 'created_by');
    }

    public function transactions()
    {
        return $this->morphMany(Transaction::class, 'creator');
    }
}
