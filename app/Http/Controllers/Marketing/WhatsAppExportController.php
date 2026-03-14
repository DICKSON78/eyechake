<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class WhatsAppExportController extends Controller
{
    use ApiResponse;

    public function export(Request $request)
    {
        $request->validate([
            'format' => 'sometimes|in:csv,excel,vcf',
            'filters' => 'nullable|array',
        ]);

        $user = $request->user();
        if (!$user) {
            return $this->sendError('Unauthorized', Response::HTTP_UNAUTHORIZED);
        }
        $clinic_id = $user->is_admin ? ($request->clinic_id ?? null) : ($user->clinic_id ?? null);

        $query = Patient::query()
            ->when($clinic_id, function ($q) use ($clinic_id) {
                $q->whereHas('check_ins', function ($q2) use ($clinic_id) {
                    $q2->whereHas('creator', function ($q3) use ($clinic_id) {
                        $q3->where('clinic_id', $clinic_id);
                    });
                });
            })
            ->whereNotNull('phone')
            ->where('phone', '!=', '');

        // Apply filters
        if ($request->filters) {
            $filters = $request->filters;
            
            if (isset($filters['is_vip']) && $filters['is_vip']) {
                $query->where('is_vip', true);
            }
            
            if (isset($filters['is_businessperson']) && $filters['is_businessperson']) {
                $query->where('is_businessperson', true);
            }
            
            if (isset($filters['min_payment']) && $filters['min_payment']) {
                $minPayment = $filters['min_payment'];
                $query->whereHas('check_ins', function ($q) use ($minPayment) {
                    $q->whereHas('payment_cache', function ($q2) use ($minPayment) {
                        $q2->whereHas('items.payments', function ($q3) use ($minPayment) {
                            $q3->select(DB::raw('SUM(amount)'))
                               ->groupBy('patient_id')
                               ->havingRaw('SUM(amount) >= ?', [$minPayment]);
                        });
                    });
                });
            }
        }

        $patients = $query->get(['id', 'first_name', 'middle_name', 'last_name', 'phone', 'email']);

        $format = $request->format ?? 'csv';
        
        if ($format === 'vcf') {
            return $this->exportVcf($patients);
        } elseif ($format === 'excel') {
            return $this->exportExcel($patients);
        } else {
            return $this->exportCsv($patients);
        }
    }

    private function exportCsv($patients)
    {
        $filename = 'whatsapp_contacts_' . date('Y-m-d_His') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($patients) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // Headers
            fputcsv($file, ['Name', 'Phone', 'Email']);
            
            // Data
            foreach ($patients as $patient) {
                fputcsv($file, [
                    $patient->full_name,
                    $patient->phone,
                    $patient->email ?? '',
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportExcel($patients)
    {
        // For Excel, we'll use CSV format with proper headers
        return $this->exportCsv($patients);
    }

    private function exportVcf($patients)
    {
        $filename = 'whatsapp_contacts_' . date('Y-m-d_His') . '.vcf';
        
        $content = '';
        foreach ($patients as $patient) {
            $content .= "BEGIN:VCARD\n";
            $content .= "VERSION:3.0\n";
            $content .= "FN:" . $patient->full_name . "\n";
            $content .= "TEL;TYPE=CELL:" . $patient->phone . "\n";
            if ($patient->email) {
                $content .= "EMAIL:" . $patient->email . "\n";
            }
            $content .= "END:VCARD\n";
        }

        return response($content, 200, [
            'Content-Type' => 'text/vcard',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}

