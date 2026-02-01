<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmsCampaignRecipient extends Model
{
    use HasFactory;

    protected $fillable = [
        'sms_campaign_id',
        'patient_id',
        'phone_number',
        'recipient_name',
        'status',
        'error_message',
        'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function campaign()
    {
        return $this->belongsTo(SmsCampaign::class, 'sms_campaign_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }
}

