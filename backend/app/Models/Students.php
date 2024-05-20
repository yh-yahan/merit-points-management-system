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
    'stage', 
    'stream', 
  ];

    use HasFactory;
}
