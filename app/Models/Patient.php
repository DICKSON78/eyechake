<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    protected $appends = ['full_name'];

    protected $fillable = [
        'first_name', 'middle_name', 'last_name', 'gender', 'date_of_birth', 'region_id', 'district_id', 'ward_id',
        'national_id', 'phone', 'occupation', 'payment_mode_id', 'is_vip', 'created_by',
    ];

    public function region()
    {
        return $this->belongsTo(Region::class, 'region_id');
    }

    public function district()
    {
        return $this->belongsTo(District::class, 'district_id');
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class, 'ward_id');
    }

    public function payment_mode()
    {
        return $this->belongsTo(PaymentMode::class, 'payment_mode_id');
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
