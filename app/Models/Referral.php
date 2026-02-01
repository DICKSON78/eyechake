<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Referral extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_id',
        'patient_id',
        'referred_to_name',
        'referred_to_type',
        'referral_reason',
        'clinical_summary',
        'status',
        'referral_date',
        'appointment_date',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'referral_date' => 'date',
        'appointment_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the consultation that owns the referral.
     */
    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    /**
     * Get the patient that is being referred.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Get the user who created the referral.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
