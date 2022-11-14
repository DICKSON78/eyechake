<?php

namespace App\Console;

use App\Models\Preference;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $send_reminders_at = Preference::find('SEND_REMINDER_MESSAGES_AT');
        if ($send_reminders_at) {
            $send_reminders_at = $send_reminders_at->value;
        } else {
            $send_reminders_at = '11:00';
        }

        $schedule->command('sms:patient_to_return_reminder')
            ->dailyAt($send_reminders_at);
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
