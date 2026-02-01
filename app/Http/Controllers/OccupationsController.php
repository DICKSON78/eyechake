<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Occupation;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class OccupationsController extends Controller
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
                'per_page' => 'sometimes|integer|min:1|max:1000',
                'page' => 'sometimes|integer|min:1',
            ]);

            $user = $request->user();
            $per_page = $request->per_page ?? 25;
            // Convert to integer if string
            $per_page = (int) $per_page;
            // Ensure per_page is at least 1 and not too large
            if ($per_page < 1) {
                $per_page = 25;
            }
            if ($per_page > 1000) {
                $per_page = 1000;
            }
            $clinic_id = $request->clinic_id;
            $status = $request->status;
            $q = $request->q;
            $data = Occupation::query();

            if ($user && ($user->is_admin ?? false)) {
                // Only load clinic relationship if it exists
                try {
                    $data->with(['clinic']);
                } catch (\Exception $e) {
                    // Relationship might not exist, continue without it
                }

                if ($clinic_id) {
                    $data->where('clinic_id', $clinic_id);
                }
            } else {
                if ($user && $user->clinic_id) {
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

            $data = $data->orderBy('name')->paginate($per_page);
            return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
        } catch (\Exception $e) {
            \Log::error('OccupationsController index error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return $this->sendError('An error occurred while fetching occupations.', Response::HTTP_INTERNAL_SERVER_ERROR);
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
        if ($user && $user->is_admin) {
            $request->validate([
                'clinic_id' => 'required|exists:clinics,id',
            ]);

            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user ? $user->clinic_id : null;
        }

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Check for unique name within clinic
        $existing = Occupation::where('clinic_id', $clinic_id)
            ->where('name', $request->name)
            ->first();

        if ($existing) {
            return $this->sendError('Occupation with this name already exists.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $input = $request->only('name', 'description', 'status');
        $input['clinic_id'] = $clinic_id;
        $data = Occupation::create($input);
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
        $data = Occupation::findOrFail($id);
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
            'name' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|in:Active,Inactive',
        ]);

        $data = Occupation::findOrFail($id);

        // Check for unique name within clinic (excluding current record)
        if ($request->has('name') && $request->name !== $data->name) {
            $existing = Occupation::where('clinic_id', $data->clinic_id)
                ->where('name', $request->name)
                ->where('id', '!=', $id)
                ->first();

            if ($existing) {
                return $this->sendError('Occupation with this name already exists.', Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $data->update($request->only('name', 'description', 'status'));
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
        $data = Occupation::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}

