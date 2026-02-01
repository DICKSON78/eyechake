<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'preferred_date',
        'preferred_time',
        'reason',
        'message',
        'status',
        'admin_reply',
        'replied_by',
        'replied_at',
    ];

    protected $casts = [
        'preferred_date' => 'date',
        'preferred_time' => 'datetime',
        'replied_at' => 'datetime',
    ];

    public function repliedBy()
    {
        return $this->belongsTo(User::class, 'replied_by');
    }

    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }
}

