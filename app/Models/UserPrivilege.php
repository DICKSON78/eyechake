<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPrivilege extends Model
{
    use HasFactory;

    public $timestamps = false;
    public $incrementing = false;
    protected $primaryKey = 'user_id';

    protected $fillable = [
        'user_id', 'reception', 'payment_center', 'consultation_room', 'optician_center', 'medicine_center',
        'procedure_room', 'inventory_management', 'financial_management', 'employee_management', 'settings',
    ];
}
