<?php

namespace App\Http\Traits;

use illuminate\Http\Response;

trait ApiResponse
{
    public function sendResponse($data = null, $response_code = Response::HTTP_OK, $message = null, $code = null)
    {
        $response = [];

        if ($message) {
            $response['message'] = $message;
        }

        if ($data) {
            $response['data'] = $data;
        }

        if ($code) {
            $response['code'] = $code;
        }

        return response()->json($response, $response_code);
    }
}
