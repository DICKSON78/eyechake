<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $appends = ['full_name'];

    protected $fillable = [
        'first_name', 'middle_name', 'last_name', 'designation', 'department_id', 'job_title_id',
        'employee_number', 'date_of_birth', 'gender', 'national_id', 'phone', 'user_id',
        'created_by', 'status',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function job_title()
    {
        return $this->belongsTo(JobTitle::class, 'job_title_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getFullNameAttribute()
    {
        $name = sprintf('%s %s %s', $this->first_name, $this->middle_name, $this->last_name);
        return preg_replace('/\s{2,}/', ' ', trim($name));
    }

    public function scopeFullName($query, $value)
    {
        return $query->whereRaw('concat(first_name, coalesce(middle_name, ""), last_name) like ?', [str_replace(' ', '', $value)]);
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
