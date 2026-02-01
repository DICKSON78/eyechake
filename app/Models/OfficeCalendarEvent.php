<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfficeCalendarEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id',
        'title',
        'description',
        'start_date',
        'end_date',
        'location',
        'color',
        'event_type',
        'reminder_type',
        'reminder_time',
        'reminder_sent',
        'is_all_day',
        'is_recurring',
        'recurring_pattern',
        'recurring_end_date',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'reminder_time' => 'datetime',
        'reminder_sent' => 'boolean',
        'is_all_day' => 'boolean',
        'is_recurring' => 'boolean',
        'recurring_end_date' => 'date',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }
}
