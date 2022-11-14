<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Preference;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PreferencesController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $data = Preference::all();
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'preferences' => 'required|array',
            'preferences.*.key' => 'required',
            'preferences.*.value' => 'nullable',
        ]);

        $data = [];

        foreach ($request->json('preferences') as &$input_preference) {
            $preference = Preference::find($input_preference['key']);
            if ($preference) {
                $preference->update(['value' => $input_preference['value']]);
            } else {
                $preference = Preference::create($input_preference);
            }

            $data[] = $preference;
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return Response
     */
    public function show($id)
    {
        $data = Preference::findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $data = Preference::findOrFail($id);
        $data->update($request->only('value'));
        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
