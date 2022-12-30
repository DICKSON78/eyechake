<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $appends = ['full_name'];

    protected $fillable = ['username', 'password', 'created_by', 'status'];

    protected $hidden = ['password', 'remember_token'];

    public function employee()
    {
        return $this->hasOne(Employee::class, 'user_id');
    }

    public function privileges()
    {
        return $this->hasMany(UserPrivilege::class, 'user_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getFullNameAttribute()
    {
        $employee = $this->employee;
        return $employee ? $employee->full_name : $this->username;
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
