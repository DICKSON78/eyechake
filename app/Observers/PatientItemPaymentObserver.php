<?php

namespace App\Observers;

use App\Models\PatientItemPayment;
use App\Services\DepartmentPerformanceUpdateService;

class PatientItemPaymentObserver
{
    /**
     * Handle the PatientItemPayment "created" event.
     */
    public function created(PatientItemPayment $payment): void
    {
        // Determine payment type and trigger appropriate updates
        $this->triggerDepartmentUpdates($payment);
    }

    /**
     * Handle the PatientItemPayment "updated" event.
     */
    public function updated(PatientItemPayment $payment): void
    {
        // Trigger updates if payment amount or status changes
        if ($payment->wasChanged(['amount', 'discount'])) {
            $this->triggerDepartmentUpdates($payment);
        }
    }

    /**
     * Trigger department performance updates based on payment type
     */
    private function triggerDepartmentUpdates(PatientItemPayment $payment)
    {
        $clinicId = $payment->creator->clinic_id ?? null;
        
        // Check if this is a medicine payment
        $hasMedicine = $payment->items()
            ->whereHas('item', function ($query) {
                $query->where('category', 'Medicine');
            })
            ->exists();

        if ($hasMedicine) {
            DepartmentPerformanceUpdateService::triggerPaymentUpdate('medicine', $payment->amount, $clinicId);
        }

        // Check if this is a glass payment
        $hasGlass = $payment->items()
            ->whereHas('consultation_type', function ($query) {
                $query->where('name', 'Glass');
            })
            ->exists();

        if ($hasGlass) {
            DepartmentPerformanceUpdateService::triggerPaymentUpdate('glass', $payment->amount, $clinicId);
        }
    }
}
