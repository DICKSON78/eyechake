<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PaymentMode;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PaymentModesController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            $request->validate([
                'per_page' => 'sometimes|integer|min:0',
                'page' => 'sometimes|integer|min:1',
            ]);

            $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $status = $request->status;
        $q = $request->q;
        $transaction_type = $request->transaction_type;
        $data = PaymentMode::query();

            if ($user->is_admin) {
                $data->with(['clinic']);

                if ($clinic_id) {
                    $data->where('clinic_id', $clinic_id);
                }
            } else {
                if ($user->clinic_id) {
                    $data->where('clinic_id', $user->clinic_id);
                } else {
                    // If user has no clinic_id, return empty result
                    $data->whereRaw('1 = 0');
                }
            }

            if ($status) {
                $data->where('status', $status);
            }

            if ($q) {
                $data->where('name', 'like', '%' . $q . '%');
            }

            if ($transaction_type) {
                $data->where('payment_type', $transaction_type);
            }

            $data = $data->paginate($per_page);
            return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('PaymentModesController index query error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->sendError('Database query error occurred', Response::HTTP_INTERNAL_SERVER_ERROR);
        } catch (\Exception $e) {
            \Log::error('PaymentModesController index error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->sendError('An error occurred while fetching data', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->is_admin) {
            $request->validate([
                'clinic_id' => 'required|exists:clinics,id',
            ]);

            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        $request->validate([
            'name' => 'required|unique:payment_modes,name',
            'transaction_type' => 'required|in:Cash,Credit',
        ]);

        $input = $request->only('name', 'description', 'status');
        $input['clinic_id'] = $clinic_id;
        // Map transaction_type (API input) to payment_type (database column)
        if ($request->has('transaction_type')) {
            $input['payment_type'] = $request->transaction_type;
        }
        $data = PaymentMode::create($input);
        return $this->sendResponse($data, Response::HTTP_OK, 'Created successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = PaymentMode::findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'sometimes|required|unique:payment_modes,name,' . $id,
            'transaction_type' => 'sometimes|required|in:Cash,Credit',
            'status' => 'sometimes|required|in:Active,Inactive',
        ]);

        $data = PaymentMode::findOrFail($id);
        $updateData = $request->only('name', 'description', 'status');
        // Map transaction_type (API input) to payment_type (database column)
        if ($request->has('transaction_type')) {
            $updateData['payment_type'] = $request->transaction_type;
        }
        $data->update($updateData);
        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $data = PaymentMode::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}
