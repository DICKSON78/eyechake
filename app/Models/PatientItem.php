<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'check_in_id', 'item_id', 'consultation_type_id', 'payment_mode_id', 'payment_type',
        'unit_price', 'quantity_required', 'quantity_served', 'discount', 'bill_id',
        'created_by', 'discounted_by', 'dosage', 'comments', 'status', 'paid_at', 'served_by', 'served_at',
    ];

    public function check_in()
    {
        return $this->belongsTo(PatientCheckIn::class, 'check_in_id');
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

    public function discounter()
    {
        return $this->belongsTo(User::class, 'discounted_by');
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
