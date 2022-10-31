<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConsultationDiagnosesController;
use App\Http\Controllers\ConsultationsController;
use App\Http\Controllers\ConsultationTypesController;
use App\Http\Controllers\DiseasesController;
use App\Http\Controllers\DistrictsController;
use App\Http\Controllers\ItemPricesController;
use App\Http\Controllers\ItemsController;
use App\Http\Controllers\ItemTypesController;
use App\Http\Controllers\LensTypesController;
use App\Http\Controllers\PatientCheckInsController;
use App\Http\Controllers\PatientItemBillPaymentsController;
use App\Http\Controllers\PatientItemBillsController;
use App\Http\Controllers\PatientPaymentCacheItemsController;
use App\Http\Controllers\PatientPaymentCacheController;
use App\Http\Controllers\PatientsController;
use App\Http\Controllers\PaymentChannelsController;
use App\Http\Controllers\PaymentModesController;
use App\Http\Controllers\RegionsController;
use App\Http\Controllers\UnitsOfMeasureController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\WardsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::group(['prefix' => 'auth'], function ($router) {
    $router->post('/login', [AuthController::class, 'login']);
});

Route::group(['middleware' => 'auth:api'], function ($router) {
    $router->post('/auth/change-password', [AuthController::class, 'changePassword']);
    $router->apiResource('/users', UsersController::class);
    $router->apiResource('/payment-modes', PaymentModesController::class);
    $router->apiResource('/payment-channels', PaymentChannelsController::class);
    $router->apiResource('/units-of-measure', UnitsOfMeasureController::class);
    $router->apiResource('/lens-types', LensTypesController::class);
    $router->apiResource('/item-types', ItemTypesController::class);
    $router->apiResource('/consultation-types', ConsultationTypesController::class);
    $router->apiResource('/items', ItemsController::class);
    $router->apiResource('/item-prices', ItemPricesController::class);
    $router->apiResource('/regions', RegionsController::class);
    $router->apiResource('/districts', DistrictsController::class);
    $router->apiResource('/wards', WardsController::class);
    $router->apiResource('/diseases', DiseasesController::class);
    $router->apiResource('/patients', PatientsController::class);
    $router->apiResource('/patient-check-ins', PatientCheckInsController::class);
    $router->apiResource('/patient-payment-cache', PatientPaymentCacheController::class);
    $router->apiResource('/patient-payment-cache-items', PatientPaymentCacheItemsController::class);
    $router->post('/patient-payment-cache-items/make-cash-payment', [PatientPaymentCacheItemsController::class, 'makeCashPayment']);
    $router->post('/patient-payment-cache-items/approve-credit-payment', [PatientPaymentCacheItemsController::class, 'approveCreditPayment']);
    $router->post('/patient-payment-cache-items/create-bill', [PatientPaymentCacheItemsController::class, 'createBill']);
    $router->post('/patient-payment-cache-items/dispense', [PatientPaymentCacheItemsController::class, 'dispense']);
    $router->post('/patient-payment-cache-items/complete', [PatientPaymentCacheItemsController::class, 'complete']);
    $router->apiResource('/patient-item-bills', PatientItemBillsController::class);
    $router->patch('/patient-item-bills/{id}/clear', [PatientItemBillsController::class, 'clear']);
    $router->apiResource('/patient-item-bill-payments', PatientItemBillPaymentsController::class);
    $router->apiResource('/consultations', ConsultationsController::class);
    $router->post('/consultations/add-item', [ConsultationsController::class, 'addItem']);
    $router->patch('/consultations/{id}/auto-save-clinical-notes', [ConsultationsController::class, 'autoSaveClinicalNotes']);
    $router->patch('/consultations/{id}/complete-clinical-notes', [ConsultationsController::class, 'completeClinicalNotes']);
    $router->apiResource('/consultation-diagnoses', ConsultationDiagnosesController::class);
});
