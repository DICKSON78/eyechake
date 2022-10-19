<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_cache_item_id', 'chief_complaint', 'history_present_illness', 'family_history',
        'review', 'remarks', 'created_by', 'status',
    ];

    public function payment_cache_item()
    {
        return $this->belongsTo(PatientPaymentCacheItem::class, 'payment_cache_item_id');
    }

    public function external_examination()
    {
        return $this->hasOne(ConsultationExternalExamination::class, 'consultation_id');
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

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
