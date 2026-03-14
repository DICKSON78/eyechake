<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $appends = ['full_name', 'is_admin'];

    protected $fillable = [
        'clinic_id', 'first_name', 'middle_name', 'last_name', 'designation', 'department_id', 'job_title_id',
        'employee_number', 'date_of_birth', 'gender', 'national_id', 'phone', 'email', 'username', 'password', 'role',
        'created_by', 'status', 'is_test_user', // Add field to identify test users
    ];

    protected $hidden = ['password', 'remember_token'];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function job_title()
    {
        return $this->belongsTo(JobTitle::class, 'job_title_id');
    }

    public function privileges()
    {
        return $this->hasMany(UserPrivilege::class, 'user_id');
    }

    /**
     * Get user privileges as array (for API responses and internal use)
     * If privileges are manually set (e.g., during login), use those instead
     */
    public function getPrivilegesAttribute()
    {
        // Check if privileges were manually set in attributes (e.g., during login)
        if (array_key_exists('privileges', $this->attributes)) {
            $value = $this->attributes['privileges'];
            // If it's already an object/array, return it as-is
            if (is_object($value) || is_array($value)) {
                return $value;
            }
            // If it's a string (JSON), try to decode it
            if (is_string($value)) {
                $decoded = json_decode($value, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return (object)$decoded;
                }
            }
        }
        // Otherwise, fetch from database and convert to object format
        $privilegesArray = UserPrivilege::getPrivilegesAsArray($this->id);
        $privilegesObj = new \stdClass();
        foreach ($privilegesArray as $privilege) {
            $privilegesObj->$privilege = true;
        }
        return $privilegesObj;
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function doctor_tasks()
    {
        return $this->hasMany(DoctorTask::class, 'doctor_id');
    }

    public function assigned_tasks()
    {
        return $this->hasMany(DoctorTask::class, 'assigned_by');
    }

    public function patient_waiting_times()
    {
        return $this->hasMany(PatientWaitingTime::class, 'doctor_id');
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

    public function scopeDoctors($query)
    {
        // Match doctors by role/designation in a case-insensitive and grouped way
        // Also include users who have doctor tasks assigned to them
        return $query->where(function ($q) {
            $q->whereRaw('LOWER(role) = ?', ['doctor'])
              ->orWhereRaw('LOWER(designation) LIKE ?', ['%doctor%'])
              ->orWhereRaw('LOWER(designation) LIKE ?', ['%physician%'])
              ->orWhereExists(function ($subQuery) {
                  $subQuery->select(\Illuminate\Support\Facades\DB::raw(1))
                          ->from('doctor_tasks')
                          ->whereRaw('doctor_tasks.doctor_id = users.id');
              });
        });
    }

    public function getIsAdminAttribute()
    {
        // Default-allow: if role is not specified, treat as Admin for access checks
        if ($this->role === null || $this->role === '') {
            return true;
        }
        return $this->role == 'Admin';
    }

    public function getIsDoctorAttribute()
    {
        return $this->role == 'Doctor' || 
               stripos($this->designation, 'doctor') !== false || 
               stripos($this->designation, 'physician') !== false;
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}