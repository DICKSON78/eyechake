<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ExternalLinksEmailAlertsController extends Controller
{
    use ApiResponse;

    /**
     * Get email alerts settings
     */
    public function getSettings(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return $this->sendError('Unauthorized', Response::HTTP_UNAUTHORIZED);
            }

            // Get settings from database or return defaults
            $clinic_id = ($user->is_admin ?? false) ? ($request->clinic_id ?? null) : ($user->clinic_id ?? null);
            
            $settings = null;
            if ($clinic_id) {
                try {
                    // Check if table exists
                    if (DB::getSchemaBuilder()->hasTable('email_alert_settings')) {
                        $settings = DB::table('email_alert_settings')
                            ->where('clinic_id', $clinic_id)
                            ->first();
                    }
                } catch (\Exception $e) {
                    \Log::warning('Email alert settings table might not exist: ' . $e->getMessage());
                    // Continue with default settings
                }
            }

        if (!$settings) {
            // Return default settings
            $settings = (object) [
                'email_alerts_enabled' => false,
                'smtp_host' => '',
                'smtp_port' => '',
                'smtp_username' => '',
                'smtp_password' => '',
                'smtp_encryption' => 'tls',
                'from_email' => '',
                'from_name' => '',
                'appointment_notifications' => false,
                'patient_registration_notifications' => false,
                'consultation_reminders' => false,
                'prescription_ready_notifications' => false,
                'bill_reminders' => false,
            ];
        }

            return $this->sendResponse($settings, Response::HTTP_OK, 'Email alerts settings retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('ExternalLinksEmailAlertsController getSettings error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return $this->sendError('An error occurred while fetching email alerts settings.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update email alerts settings
     */
    public function updateSettings(Request $request)
    {
        try {
            $request->validate([
                'email_alerts_enabled' => 'sometimes|boolean',
                'smtp_host' => 'nullable|string|max:255',
                'smtp_port' => 'nullable|string|max:10',
                'smtp_username' => 'nullable|string|max:255',
                'smtp_password' => 'nullable|string|max:255',
                'smtp_encryption' => 'nullable|in:tls,ssl,none',
                'from_email' => 'nullable|email|max:255',
                'from_name' => 'nullable|string|max:255',
                'appointment_notifications' => 'sometimes|boolean',
                'patient_registration_notifications' => 'sometimes|boolean',
                'consultation_reminders' => 'sometimes|boolean',
                'prescription_ready_notifications' => 'sometimes|boolean',
                'bill_reminders' => 'sometimes|boolean',
            ]);

            $user = $request->user();
            
            if (!$user) {
                return $this->sendError('Unauthorized', Response::HTTP_UNAUTHORIZED);
            }
            
            $clinic_id = ($user->is_admin ?? false) ? ($request->clinic_id ?? null) : ($user->clinic_id ?? null);

            if (!$clinic_id) {
                return $this->sendError('Clinic ID is required.', Response::HTTP_BAD_REQUEST);
            }

            // Check if table exists
            if (!DB::getSchemaBuilder()->hasTable('email_alert_settings')) {
                return $this->sendError('Email alert settings table does not exist. Please run migrations.', Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            $settings = DB::table('email_alert_settings')
                ->where('clinic_id', $clinic_id)
                ->first();

            $data = $request->only([
                'email_alerts_enabled',
                'smtp_host',
                'smtp_port',
                'smtp_username',
                'smtp_password',
                'smtp_encryption',
                'from_email',
                'from_name',
                'appointment_notifications',
                'patient_registration_notifications',
                'consultation_reminders',
                'prescription_ready_notifications',
                'bill_reminders',
            ]);

            if ($settings) {
                DB::table('email_alert_settings')
                    ->where('clinic_id', $clinic_id)
                    ->update($data);
            } else {
                $data['clinic_id'] = $clinic_id;
                DB::table('email_alert_settings')->insert($data);
            }

            return $this->sendResponse($data, Response::HTTP_OK, 'Email alerts settings updated successfully.');
        } catch (\Exception $e) {
            \Log::error('ExternalLinksEmailAlertsController updateSettings error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return $this->sendError('An error occurred while updating email alerts settings.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

