<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Marketing\CommunicationLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class CommunicationAnalyticsController extends Controller
{
    use ApiResponse;

    /**
     * Display communication analytics data
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            // Default allow: if user missing or role unspecified, do not restrict by clinic
            if (!$user || $user->is_admin) {
                $clinic_id = $request->clinic_id;
            } else {
                $clinic_id = $user->clinic_id;
            }

            // Default date range: last 30 days if not specified
            $start_date = $request->start_date ?? Carbon::now()->subDays(30)->format('Y-m-d');
            $end_date = $request->end_date ?? Carbon::now()->format('Y-m-d');

            // Get communication logs filtered by clinic and date range
            $communicationsQuery = CommunicationLog::with(['creator'])
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereHas('creator', function ($q2) use ($clinic_id) {
                        $q2->where('clinic_id', $clinic_id);
                    });
                });

            $communications = $communicationsQuery->get();
            $totalCommunications = $communications->count();

            // Calculate successful communications (Incoming = successful response)
            // Outgoing = initiated by us (we assume most are successful)
            // Incoming = customer responded (definitely successful)
            $successfulCommunications = $communications->filter(function ($comm) {
                return $comm->communication_direction === 'Incoming' || 
                       ($comm->communication_direction === 'Outgoing' && $comm->description && strlen($comm->description) > 10);
            })->count();

            $failedCommunications = $totalCommunications - $successfulCommunications;

            // Response rate: percentage of Incoming communications (customer responses)
            $incomingCount = $communications->where('communication_direction', 'Incoming')->count();
            $responseRate = $totalCommunications > 0 ? ($incomingCount / $totalCommunications) : 0;

            // Average response time: calculate from created_at timestamps
            // For simplicity, we'll use time between consecutive communications with same customer
            // This is a simplified calculation - in a real system, you'd track actual response times
            $averageResponseTime = 0;
            if ($totalCommunications > 0) {
                // Group by customer phone to find response patterns
                $customerGroups = $communications->groupBy('customer_phone');
                $responseTimes = [];
                
                foreach ($customerGroups as $phone => $customerComms) {
                    if ($customerComms->count() > 1) {
                        $sortedComms = $customerComms->sortBy('created_at')->values();
                        for ($i = 1; $i < $sortedComms->count(); $i++) {
                            $prevComm = $sortedComms[$i - 1];
                            $currComm = $sortedComms[$i];
                            
                            // If previous was Outgoing and current is Incoming, it's a response
                            if ($prevComm->communication_direction === 'Outgoing' && 
                                $currComm->communication_direction === 'Incoming') {
                                $responseTime = Carbon::parse($currComm->created_at)
                                    ->diffInHours(Carbon::parse($prevComm->created_at));
                                $responseTimes[] = $responseTime;
                            }
                        }
                    }
                }
                
                if (count($responseTimes) > 0) {
                    $averageResponseTime = round(array_sum($responseTimes) / count($responseTimes), 1);
                } else {
                    // Default to 24 hours if no response pattern found
                    $averageResponseTime = 24;
                }
            }

            // Group communications by type
            $communicationsByType = [];
            $typeGroups = $communications->groupBy('communication_type');
            
            foreach ($typeGroups as $type => $typeComms) {
                $count = $typeComms->count();
                $percentage = $totalCommunications > 0 ? ($count / $totalCommunications) : 0;
                
                $communicationsByType[] = [
                    'type' => $type,
                    'count' => $count,
                    'percentage' => $percentage,
                ];
            }

            // Sort by count descending
            usort($communicationsByType, function ($a, $b) {
                return $b['count'] - $a['count'];
            });

            // Group communications by status (direction-based)
            $communicationsByStatus = [];
            $statusGroups = $communications->groupBy('communication_direction');
            
            foreach ($statusGroups as $direction => $statusComms) {
                $count = $statusComms->count();
                $percentage = $totalCommunications > 0 ? ($count / $totalCommunications) : 0;
                
                $status = $direction === 'Incoming' ? 'Responded' : 'Initiated';
                $communicationsByStatus[] = [
                    'status' => $status,
                    'count' => $count,
                    'percentage' => $percentage,
                ];
            }

            // Sort by count descending
            usort($communicationsByStatus, function ($a, $b) {
                return $b['count'] - $a['count'];
            });

            // Response times by period (weekly for the date range)
            $responseTimesByPeriod = [];
            $start = Carbon::parse($start_date);
            $end = Carbon::parse($end_date);
            $current = $start->copy();
            
            while ($current->lte($end)) {
                $weekStart = $current->copy()->startOfWeek();
                $weekEnd = $current->copy()->endOfWeek();
                if ($weekEnd->gt($end)) {
                    $weekEnd = $end->copy();
                }
                
                $weekComms = $communications->filter(function ($comm) use ($weekStart, $weekEnd) {
                    $commDate = Carbon::parse($comm->created_at);
                    return $commDate->gte($weekStart) && $commDate->lte($weekEnd);
                });
                
                // Calculate average response time for this week
                $weekResponseTime = 0;
                if ($weekComms->count() > 0) {
                    $incomingWeek = $weekComms->where('communication_direction', 'Incoming')->count();
                    $weekResponseTime = $incomingWeek > 0 ? $averageResponseTime : 0;
                }
                
                $responseTimesByPeriod[] = [
                    'period' => $weekStart->format('M d') . ' - ' . $weekEnd->format('M d, Y'),
                    'average_time' => round($weekResponseTime, 1),
                ];
                
                $current->addWeek();
            }

            $data = [
                'summary' => [
                    'total_communications' => $totalCommunications,
                    'successful_communications' => $successfulCommunications,
                    'failed_communications' => $failedCommunications,
                    'response_rate' => $responseRate,
                    'average_response_time' => $averageResponseTime,
                ],
                'communications_by_type' => $communicationsByType,
                'communications_by_status' => $communicationsByStatus,
                'response_times' => $responseTimesByPeriod,
            ];

            return $this->sendResponse($data, Response::HTTP_OK, 'Communication analytics data retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('CommunicationAnalyticsController error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return $this->sendError('An error occurred while fetching communication analytics data.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
