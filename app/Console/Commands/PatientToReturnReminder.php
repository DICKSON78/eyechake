<?php

namespace App\Console\Commands;

use App\Http\Services\SmsService;
use App\Models\Consultation;
use App\Models\Preference;
use Carbon\Carbon;
use Illuminate\Console\Command;

class PatientToReturnReminder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sms:patient_to_return_reminder';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command to check patients to return and send reminder message';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $send_messages = Preference::find('SEND_MESSAGES');
        if ($send_messages && $send_messages->value == 'Yes') {
            $message = Preference::find('PATIENT_TO_RETURN_REMINDER_MESSAGE');
            if ($message) {
                $today = Carbon::today();
                $records = Consultation::where('status', 'Consulted')
                    ->where('consultant', 'Doctor')
                    ->where('patient_to_return', 'Yes')
                    ->whereNotNull('to_return_date')
                    ->where('to_return_date', '>=', $today)
                    ->get();

                if (count($records)) {
                    $sms_service = new SmsService();

                    foreach ($records as &$record) {
                        $days = Carbon::parse($record->to_return_date)->diffInDays($today);

                        if ($days == 1) {
                            $patient = $record->payment_cache_item->payment_cache->check_in->patient;
                            $message = $message->value;
                            $message = str_replace('{name}', $patient->first_name, $message);

                            $date = Carbon::parse($record->to_return_date);
                            $date = $date->format('M d, Y');

                            $message = str_replace('{date}', $date, $message);
                            $sms_service->sendMessage($patient->id, $message);
                        }
                    }
                }
            }
        }

        return 0;
    }
}
