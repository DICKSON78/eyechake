<?php

namespace App\Http\Services;

use App\Models\Message;
use App\Models\Patient;
use App\Models\Preference;
use Carbon\Carbon;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use Psy\Util\Str;

class SmsService
{
    private $sendMessageUrl = 'https://apisms.beem.africa/v1/send';
    private $deliveryReportUrl = 'https://dlrapi.beem.africa/public/v1/delivery-reports';
    private $smsApiKey = '776d2b75d12ab761';
    private $smsSecretKey = 'MzM2N2JkZjYxMWJlNjM5NWZiZmRiZmM1ODZiOGNhMjA4ODVlZGNjMWVhMmUzMTZhZGYwMDBkZDUwNzc1MDdkZA==';
    private $smsEncoding = 0;

    /**
     * Send message to patient.
     *
     * @param $patient_id
     * @param string $message
     * @return null|string String representation of response body
     */
    public function sendMessage($patient_id, $message)
    {
        if (!$patient_id) {
            return null;
        }

        $recipients = [];
        $patient = Patient::find($patient_id);
        $phone = $patient->phone;

        if ($phone && str_starts_with($phone, '0') && strlen($phone) == 10) {
            $recipients[] = [
                'recipient_id' => Carbon::now()->getTimestamp(),
                'dest_addr' => '255' . substr($patient->phone, 1),
            ];
        }

        if (!count($recipients)) {
            return null;
        }

        $sender_name = Preference::find('SMS_SENDER_NAME');
        if ($sender_name) {
            $sender_name = $sender_name->value;
        } else {
            $sender_name = 'INFO';
        }

        $body = [
            'source_addr' => $sender_name,
            'encoding' => $this->smsEncoding,
            'schedule_time' => '',
            'message' => $message,
            'recipients' => $recipients,
        ];

        $hash = base64_encode(sprintf('%s:%s', $this->smsApiKey, $this->smsSecretKey));
        $headers = [
            'Authorization' => 'Basic ' . $hash,
            'Content-Type' => 'application/json',
        ];

        try {
            $client = new Client();
            $params['headers'] = $headers;
            $params['json'] = $body;
            $response = $client->post($this->sendMessageUrl, $params)
                ->getBody()
                ->getContents();

            if ($response) {
                Message::create([
                    'message' => $message,
                    'phone' => $patient->phone,
                    'api_response' => $response,
                    'patient_id' => $patient_id,
                ]);
            }

            return $response;
        } catch (Exception $exception) {
            Log::debug($exception);
            return null;
        }
    }

    public function getMessageDeliveryReport($request_id, $recipient = null)
    {
        $hash = base64_encode(sprintf('%s:%s', $this->smsApiKey, $this->smsSecretKey));
        $headers = [
            'Authorization' => 'Basic ' . $hash,
            'Content-Type' => 'application/json',
        ];

        try {

            $client = new Client();
            $params['headers'] = $headers;

            $url = sprintf('%s?request_id=%s', $this->deliveryReportUrl, $request_id);

            if ($recipient) {
                $url = sprintf('%s?dest_addr=%s&request_id=%s',
                    $this->deliveryReportUrl,
                    '255' . substr($recipient, 1),
                    $request_id);
            }

            $response = $client->get($url, $params)
                ->getBody()
                ->getContents();
            $response = json_decode($response);
            return $response;
        } catch (Exception $exception) {
            Log::debug($exception);
            return null;
        }
    }
}
