<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExpensePayment extends Model
{
    use HasFactory;

    // Include channel_id so payments can be mass-assigned and filtered by channel
    protected $fillable = ['expense_id', 'amount', 'description', 'channel_id', 'created_by'];

    public function expense()
    {
        return $this->belongsTo(Expense::class, 'expense_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function channel()
    {
        return $this->belongsTo(PaymentChannel::class, 'channel_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
