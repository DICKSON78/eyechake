<?php

namespace App\Observers;

use App\Models\PatientCheckIn;
use App\Services\DepartmentPerformanceUpdateService;

class PatientCheckInObserver
{
    /**
     * Handle the PatientCheckIn "created" event.
     */
    public function created(PatientCheckIn $checkIn): void
    {
        // Trigger department performance updates for new patient visit
        $clinicId = $checkIn->creator->clinic_id ?? null;
        DepartmentPerformanceUpdateService::triggerPatientVisitUpdate($clinicId);
    }

    /**
     * Handle the PatientCheckIn "updated" event.
     */
    public function updated(PatientCheckIn $checkIn): void
    {
        // Trigger updates if patient status or contact information changes
        if ($checkIn->wasChanged(['status', 'notes'])) {
            $clinicId = $checkIn->creator->clinic_id ?? null;
            DepartmentPerformanceUpdateService::triggerPatientVisitUpdate($clinicId);
        }
    }
}
