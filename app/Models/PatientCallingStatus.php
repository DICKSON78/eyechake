<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientCallingStatus extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'status',
        'notes',
        'called_by',
        'called_at',
        'created_by',
    ];

    protected $casts = [
        'called_at' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function called_by_user()
    {
        return $this->belongsTo(User::class, 'called_by');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

