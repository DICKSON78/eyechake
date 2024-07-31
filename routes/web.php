<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::get('/sms', function () {
//     $service = new \App\Http\Services\SmsService();
//     $service->sendMessage(1, 'Hello Jay, asante kwa kupata huduma kwetu. Karibu tena.');
//     return response()->json(['message' => 'OK']);
// });

Route::get('/login', function () {
    return view('app');
})->name('login');

Route::get('/{any?}', function () {
    return view('app');
})->where('any', '[\/\w\.-]*');
