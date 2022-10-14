<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientPaymentCacheItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_cache_id', 'item_id', 'consultation_type_id', 'consultant_id', 'payment_mode_id',
        'unit_price', 'quantity', 'item_payment_id', 'bill_id', 'created_by', 'dosage', 'comments', 'status',
        'served_by', 'served_at',
    ];

    public function payment_cache()
    {
        return $this->belongsTo(PatientPaymentCache::class, 'payment_cache_id');
    }

    public function item()
    {
        return $this->belongsTo(Item::class, 'item_id');
    }

    public function consultation_type()
    {
        return $this->belongsTo(ConsultationType::class, 'consultation_type_id');
    }

    public function payment_mode()
    {
        return $this->belongsTo(PaymentMode::class, 'payment_mode_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function server()
    {
        return $this->belongsTo(User::class, 'served_by');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
