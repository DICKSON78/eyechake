<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMode extends Model
{
    use HasFactory;

    protected $fillable = ['clinic_id', 'name', 'description', 'payment_type', 'status'];
    
    // Alias for backward compatibility - payment_type is the actual column name
    public function getTransactionTypeAttribute()
    {
        return $this->payment_type;
    }
    
    public function setTransactionTypeAttribute($value)
    {
        $this->attributes['payment_type'] = $value;
    }

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
