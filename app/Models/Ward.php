<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ward extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'district_id', 'status'];

    public function district()
    {
        return $this->belongsTo(District::class, 'district_id');
    }
}
