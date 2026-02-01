<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id',
        'employee_id',
        'report_type',
        'report_date',
        'end_date',
        'activities_completed',
        'achievements',
        'challenges_faced',
        'tasks_pending',
        'next_period_plans',
        'additional_notes',
        'status',
        'submitted_by',
        'submitted_at',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason',
        'manager_comments',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'report_date' => 'date',
        'end_date' => 'date',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejectedBy()
    {
        return $this->belongsTo(User::class, 'rejected_by');
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

