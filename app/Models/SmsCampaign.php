<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmsCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'message',
        'type',
        'status',
        'scheduled_at',
        'total_recipients',
        'sent_count',
        'failed_count',
        'recipient_filters',
        'created_by',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'recipient_filters' => 'array',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function recipients()
    {
        return $this->hasMany(SmsCampaignRecipient::class, 'sms_campaign_id');
    }
}

