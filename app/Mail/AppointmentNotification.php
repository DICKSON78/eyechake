<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AppointmentNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $appointment;
    public $subject;
    public $message;

    /**
     * Create a new message instance.
     */
    public function __construct(Appointment $appointment, $subject, $message = null)
    {
        $this->appointment = $appointment;
        $this->subject = $subject;
        $this->message = $message;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject($this->subject)
            ->view('emails.appointment-notification')
            ->with([
                'appointment' => $this->appointment,
                'customMessage' => $this->message,
            ]);
    }
}

