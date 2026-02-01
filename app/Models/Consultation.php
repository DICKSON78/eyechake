<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_cache_item_id', 'patient_direction', 'chief_complaint', 'history_present_illness',
        'family_history', 'general_health',
        // Note: family_ocular_history and family_general_history removed - columns don't exist in database
        'patient_to_return', 'to_return_date', 'return_reason', 'remarks', 'created_by',
        'status', 'require_glass', 'sent_to_optician_at', 'sent_to_optician_by', 'lens_types',
        'doctor_recommendations', 'doctor_comments_remarks', 'optician_completed_at',
    ];

    protected $casts = [
        'sent_to_optician_at' => 'datetime:Y-m-d H:i',
        'optician_completed_at' => 'datetime:Y-m-d H:i',
    ];

    public function payment_cache_item()
    {
        return $this->belongsTo(PatientPaymentCacheItem::class, 'payment_cache_item_id');
    }

    public function payment_cache()
    {
        return $this->hasMany(PatientPaymentCache::class, 'consultation_id');
    }

    public function diagnoses()
    {
        return $this->hasMany(ConsultationDiagnosis::class, 'consultation_id');
    }

    public function external_examination()
    {
        return $this->hasOne(ConsultationExternalExamination::class, 'consultation_id');
    }

    public function functional_tests()
    {
        return $this->hasOne(ConsultationFunctionalTest::class, 'consultation_id');
    }

    public function visual_acuity()
    {
        return $this->hasOne(ConsultationVisualAcuity::class, 'consultation_id');
    }

    public function refraction()
    {
        return $this->hasOne(ConsultationRefraction::class, 'consultation_id');
    }

    public function fundoscopy()
    {
        return $this->hasOne(ConsultationFundoscopy::class, 'consultation_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function to_optician_sender()
    {
        return $this->belongsTo(User::class, 'sent_to_optician_by');
    }

    public function doctor_tasks()
    {
        return $this->hasMany(DoctorTask::class, 'consultation_id');
    }

    /**
     * Get the referrals for the consultation.
     */
    public function referrals()
    {
        return $this->hasMany(Referral::class, 'consultation_id');
    }

    /**
     * Get the latest referral for the consultation.
     */
    public function referral()
    {
        return $this->hasOne(Referral::class, 'consultation_id')->latest();
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
