<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Teachers extends Authenticatable
{
  use HasApiTokens;

  protected $fillable = [
    'name', 
    'email', 
    'password', 
    'description',
  ];

    use HasFactory;
}
