<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Students extends Authenticatable
{
  use HasApiTokens;

  protected $fillable = [
    'name',
    'username',
    'email',
    'password',
    'class',
    'stream',
    'date_joined',
    'status',
  ];

  use HasFactory;

  public function transaction()
  {
    return $this->hasMany(Transaction::class, 'receiver_id');
  }

  public function points()
  {
    return $this->hasOne(Points::class, 'id');
  }

  public function setting()
  {
    return $this->hasOne(StudentSetting::class);
  }
}
