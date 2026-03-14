<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\SmsCampaign;
use App\Models\SmsCampaignRecipient;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class CampaignPerformanceController extends Controller
{
    use ApiResponse;

    /**
     * Display campaign performance data
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

            // Get SMS campaigns
            $campaignsQuery = SmsCampaign::with(['recipients'])
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereHas('creator', function ($q2) use ($clinic_id) {
                        $q2->where('clinic_id', $clinic_id);
                    });
                });

            $campaigns = $campaignsQuery->get();

            // Calculate summary statistics
            $totalCampaigns = $campaigns->count();
            $activeCampaigns = $campaigns->where('status', 'sending')->count();
            
            $totalViews = 0; // SMS campaigns don't have views, using sent count
            $totalClicks = 0; // SMS campaigns don't have clicks
            $totalConversions = 0; // Could be based on successful sends or patient responses
            
            $totalSent = 0;
            $totalFailed = 0;
            $totalUnreachable = 0;

            $campaignDetails = [];

            foreach ($campaigns as $campaign) {
                $recipients = $campaign->recipients ?? collect();
                
                $sent = $recipients->where('status', 'sent')->count();
                $failed = $recipients->where('status', 'failed')->count();
                $unreachable = $recipients->where('status', 'unreachable')->count();
                $pending = $recipients->where('status', 'pending')->count();
                
                $totalSent += $sent;
                $totalFailed += $failed;
                $totalUnreachable += $unreachable;
                
                // Calculate CTR (Click-Through Rate) - for SMS, we'll use success rate
                $totalRecipients = $recipients->count();
                $successRate = $totalRecipients > 0 ? ($sent / $totalRecipients) : 0;
                
                $campaignDetails[] = [
                    'name' => $campaign->title,
                    'description' => $campaign->message,
                    'views' => $totalRecipients, // Using recipients as "views"
                    'clicks' => $sent, // Using sent as "clicks"
                    'ctr' => $successRate, // Success rate as CTR
                    'status' => $campaign->status,
                    'sent_count' => $sent,
                    'failed_count' => $failed,
                    'unreachable_count' => $unreachable,
                    'pending_count' => $pending,
                    'total_recipients' => $totalRecipients,
                    'created_at' => $campaign->created_at,
                ];
            }

            // Calculate average CTR
            $averageCtr = count($campaignDetails) > 0
                ? collect($campaignDetails)->avg('ctr')
                : 0;

            // Use sent count as "views" and successful sends as "conversions"
            $totalViews = $totalSent + $totalFailed + $totalUnreachable;
            $totalConversions = $totalSent;

            $data = [
                'summary' => [
                    'total_campaigns' => $totalCampaigns,
                    'active_campaigns' => $activeCampaigns,
                    'total_views' => $totalViews,
                    'total_clicks' => $totalSent,
                    'total_conversions' => $totalConversions,
                    'average_ctr' => $averageCtr,
                ],
                'campaigns' => $campaignDetails,
            ];

            return $this->sendResponse($data, Response::HTTP_OK, 'Campaign performance data retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('CampaignPerformanceController error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return $this->sendError('An error occurred while fetching campaign performance data.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

