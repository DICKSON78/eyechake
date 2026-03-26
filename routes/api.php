<?php
use App\Http\Controllers\Reports\FinancialManagementReportsController;
use App\Http\Controllers\Admin\DeleteTestUsersController;
use App\Http\Controllers\DispensingDashboardController;
use App\Http\Controllers\Reports\InventoryManagementReportsController;
use App\Http\Controllers\PaymentCenterDashboardController;
use App\Http\Controllers\Reports\PaymentCenterReportsController;
use App\Http\Controllers\ReceptionDashboardController;

use App\Http\Controllers\AppointmentsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CataractSurgeryRecordsController;
use App\Http\Controllers\ClinicsController;
use App\Http\Controllers\ConsultationDiagnosesController;
use App\Http\Controllers\ConsultationsController;
use App\Http\Controllers\ConsultationTypesController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentsController;
use App\Http\Controllers\DiseasesController;
use App\Http\Controllers\OccupationsController;
use App\Http\Controllers\PatientsToReturnController;
use App\Http\Controllers\EmployeeSalesPerformanceController;
use App\Http\Controllers\LensStockController;
use App\Http\Controllers\DistrictsController;
use App\Http\Controllers\ExpenseCategoriesController;
use App\Http\Controllers\ExpensePaymentsController;
use App\Http\Controllers\ExpensesController;
use App\Http\Controllers\ItemPricesController;
use App\Http\Controllers\ItemsController;
use App\Http\Controllers\ItemTypesController;
use App\Http\Controllers\JobTitlesController;
use App\Http\Controllers\LensTypesController;
use App\Http\Controllers\Marketing\BulkSmsController;
use App\Http\Controllers\Marketing\CampaignPerformanceController;
use App\Http\Controllers\Marketing\ClientCallingStatusController;
use App\Http\Controllers\Marketing\LeadGenerationController;
use App\Http\Controllers\Marketing\CommunicationLogsController;
use App\Http\Controllers\Marketing\CommunicationAnalyticsController;
use App\Http\Controllers\Marketing\DailyActivitiesController;
use App\Http\Controllers\Marketing\EventsController;
use App\Http\Controllers\Marketing\HighValuePatientsController;
use App\Http\Controllers\Marketing\IdeasController;
use App\Http\Controllers\Marketing\InformationSourcesController;
use App\Http\Controllers\Marketing\MarketingDashboardController;
use App\Http\Controllers\Marketing\MarketingStrategiesController;
use App\Http\Controllers\Marketing\PrestigeClientsController;
use App\Http\Controllers\Marketing\ResearchPlansController;
use App\Http\Controllers\Marketing\UnreachableNumbersController;
use App\Http\Controllers\Marketing\WhatsAppExportController;
use App\Http\Controllers\MessagesController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\PatientAttachmentsController;
use App\Http\Controllers\PatientCheckInsController;
use App\Http\Controllers\PatientItemBillPaymentsController;
use App\Http\Controllers\PatientItemBillsController;
use App\Http\Controllers\PatientItemPaymentsController;
use App\Http\Controllers\PatientPaymentCacheController;
use App\Http\Controllers\PatientPaymentCacheItemsController;
use App\Http\Controllers\PatientsController;
use App\Http\Controllers\PatientWaitingTimesController;
use App\Http\Controllers\DoctorTasksController;
use App\Http\Controllers\PaymentChannelsController;
use App\Http\Controllers\PaymentModesController;
use App\Http\Controllers\PreferencesController;
use App\Http\Controllers\RegionsController;
use App\Http\Controllers\CRMReportsController;
use App\Http\Controllers\DepartmentPerformanceController;
use App\Http\Controllers\StocktakesController;
use App\Http\Controllers\SurgeryRecordReportsController;
use App\Http\Controllers\UnitsOfMeasureController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\WardsController;
use App\Http\Controllers\StockAlertsController;
use App\Http\Controllers\MedicineTakingController;
use App\Http\Controllers\MedicinesController;
use App\Http\Controllers\PatientNotificationsController;
use App\Http\Controllers\MedicineCenterDashboardController;
use App\Http\Controllers\OtherDispensingDashboardController;
use App\Http\Controllers\InventoryManagementDashboardController;
use App\Http\Controllers\FinancialManagementDashboardController;
use App\Http\Controllers\ProcedureRoomDashboardController;
use App\Http\Controllers\ConsultationRoomDashboardController;
use App\Http\Controllers\OpticianCenterDashboardController;
use App\Http\Controllers\SalesCenterDashboardController;
use App\Http\Controllers\SalesCenterPrescriptionsController;
use App\Http\Controllers\SalesManagementDashboardController;
use App\Http\Controllers\DirectorDashboardController;
use App\Http\Controllers\EmployeePerformanceController;
use App\Http\Controllers\OfficeCalendarController;
use App\Http\Controllers\OfficeCalendarSubscribersController;
use App\Http\Controllers\OfficeCalendarContactSubmissionsController;
use App\Http\Controllers\EmployeeReportsController;
use App\Http\Controllers\ReferralsController;
use App\Http\Controllers\ExternalLinksEmailAlertsController;
use App\Http\Controllers\ExternalLinksWebsiteAppointmentsController;
use App\Http\Controllers\PerformanceDashboardController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

// Authentication routes with rate limiting
Route::group(['prefix' => 'auth'], function ($router) {
    $router->post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1'); // 5 attempts per minute
});

// Public routes - accessible without authentication
Route::get('/units-of-measure', [UnitsOfMeasureController::class, 'index']);
Route::post('/appointments', [AppointmentsController::class, 'store']);
Route::post('/office-calendar/subscribers', [OfficeCalendarSubscribersController::class, 'store']);
Route::post('/office-calendar/contact-submissions', [OfficeCalendarContactSubmissionsController::class, 'store']);

// Health check endpoint
Route::get('/health', function () {
    try {
        // Test database connection
        DB::connection()->getPdo();
        return response()->json([
            'status' => 'healthy',
            'database' => 'connected',
            'timestamp' => now()->toISOString()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'unhealthy',
            'database' => 'disconnected',
            'error' => $e->getMessage(),
            'timestamp' => now()->toISOString()
        ], 500);
    }
});

// Notifications route - requires auth to get user's clinic_id for proper filtering
Route::get('/notifications', [NotificationsController::class, '__invoke'])->middleware('auth:api');
Route::get('/notifications/dynamic', [NotificationsController::class, 'getDynamicNotifications'])->middleware('auth:api');

// Test authentication endpoint
Route::get('/test-auth', function (\Illuminate\Http\Request $request) {
    return response()->json([
        'authenticated' => auth()->check(),
        'user' => auth()->user() ? auth()->user()->id : null,
        'headers' => $request->headers->all()
    ]);
})->middleware('auth:api');

// Shared patient read routes - accessible by multiple roles
Route::group(['middleware' => ['auth:api']], function ($router) {
    $router->controller(PatientsController::class)->prefix('patients')->group(function ($router) {
        $router->get('/', 'index');
        $router->get('/{id}', 'show');
    });
});

// Reception routes - require reception privilege
Route::group(['middleware' => ['auth:api', 'privilege:reception']], function ($router) {
    $router->controller(PatientsController::class)->prefix('patients')->group(function ($router) {
        $router->post('/', 'store');
        $router->put('/{id}', 'update');
        $router->delete('/{id}', 'destroy');
    });
    
    $router->controller(PatientsToReturnController::class)->prefix('patients-to-return')->group(function ($router) {
        $router->get('/', 'index');
        $router->post('/{id}/return', 'markAsReturned');
    });
    
    $router->controller(MessagesController::class)->prefix('messages')->group(function ($router) {
        $router->get('/', 'index');
        $router->post('/', 'store');
    });
});

// Cashier routes - require payment_center privilege
Route::group(['middleware' => ['auth:api', 'privilege:payment_center']], function ($router) {
    $router->controller(PatientPaymentCacheController::class)->prefix('patient-payment-cache')->group(function ($router) {
        $router->get('/', 'index');
        $router->post('/', 'store');
        $router->get('/{id}', 'show');
        $router->put('/{id}', 'update');
    });
    
    $router->controller(PatientItemBillsController::class)->prefix('patient-bills')->group(function ($router) {
        $router->get('/', 'index');
        $router->post('/', 'store');
        $router->get('/{id}', 'show');
        $router->put('/{id}', 'update');
    });
    
    $router->controller(ExpensesController::class)->prefix('expenses')->group(function ($router) {
        $router->get('/', 'index');
        $router->post('/', 'store');
        $router->get('/{id}', 'show');
        $router->put('/{id}', 'update');
    });
});

// Consultation room routes - require consultation_room privilege
Route::group(['middleware' => ['auth:api', 'privilege:consultation_room']], function ($router) {
    $router->controller(ConsultationsController::class)->prefix('consultations')->group(function ($router) {
        $router->get('/', 'index');
        $router->post('/', 'store');
        $router->get('/{id}', 'show');
        $router->put('/{id}', 'update');
    });
    
    $router->controller(ConsultationDiagnosesController::class)->prefix('consultation-diagnoses')->group(function ($router) {
        $router->get('/', 'index');
        $router->post('/', 'store');
        $router->get('/{id}', 'show');
        $router->put('/{id}', 'update');
    });
});

// Sales routes - require sales_center privilege
Route::group(['middleware' => ['auth:api', 'privilege:sales_center']], function ($router) {
    // Routes will be added when controllers are created
});

// Pharmacy routes - require medicine_center privilege
Route::group(['middleware' => ['auth:api', 'privilege:medicine_center']], function ($router) {
    // Routes will be added when controllers are created
});

// Workshop routes - require optician_center privilege
Route::group(['middleware' => ['auth:api', 'privilege:optician_center']], function ($router) {
    // Routes will be added when controllers are created
});

// Financial management routes - require financial_management privilege
Route::group(['middleware' => ['auth:api', 'privilege:financial_management']], function ($router) {
    // Routes will be added when controllers are created
});

// Marketing routes - require marketing privilege
Route::group(['middleware' => ['auth:api', 'privilege:marketing']], function ($router) {
    $router->controller(MarketingDashboardController::class)->prefix('marketing')->group(function ($router) {
        $router->get('/dashboard', '__invoke');
    });
    
    $router->controller(DailyActivitiesController::class)->prefix('marketing')->group(function ($router) {
        $router->get('/daily-activities', 'index');
        $router->post('/daily-activities', 'store');
        $router->put('/daily-activities/{id}', 'update');
        $router->delete('/daily-activities/{id}', 'destroy');
    });
    
    $router->controller(MarketingStrategiesController::class)->prefix('marketing')->group(function ($router) {
        $router->get('/marketing-strategies', 'index');
        $router->post('/marketing-strategies', 'store');
        $router->put('/marketing-strategies/{id}', 'update');
        $router->delete('/marketing-strategies/{id}', 'destroy');
    });
    
    $router->controller(PrestigeClientsController::class)->prefix('marketing')->group(function ($router) {
        $router->get('/prestige-clients', 'index');
        $router->get('/prestige-clients/{id}', 'show');
    });
});

// Employee management routes - require employee_management privilege
Route::group(['middleware' => ['auth:api', 'privilege:employee_management']], function ($router) {
    // Routes will be added when controllers are created
});

// Settings routes - require settings privilege (Admin and Director only)
Route::group(['middleware' => ['auth:api', 'privilege:settings']], function ($router) {
    // Routes will be added when controllers are created
});

// Director routes - require director privilege
Route::group(['middleware' => ['auth:api', 'privilege:director']], function ($router) {
    // Routes will be added when controllers are created
});

// Admin only routes - require admin role
Route::group(['middleware' => ['auth:api', 'role:Admin']], function ($router) {
    // Routes will be added when controllers are created
});

// Main authenticated routes group
Route::group(['middleware' => 'auth:api'], function ($router) {
    $router->controller(AuthController::class)->prefix('auth')->group(function ($router) {
        $router->post('/change-password', 'changePassword');
        $router->get('/user', 'getAuthUser');
    });

     // VIP Patients - move this inside the main auth group
    $router->get('/patients/vip', [PatientsController::class, 'vipPatients']);
    
    // Patient Waiting Times
    $router->prefix('patient-waiting-times')->group(function ($router) {
        $router->get('/', [PatientWaitingTimesController::class, 'index']);
        $router->get('/statistics', [PatientWaitingTimesController::class, 'statistics']);
        $router->post('/{id}/start-treatment', [PatientWaitingTimesController::class, 'startTreatment']);
        $router->post('/{id}/end-treatment', [PatientWaitingTimesController::class, 'endTreatment']);
        $router->post('/{id}/force-complete-treatment', [PatientWaitingTimesController::class, 'forceCompleteTreatment']);
        $router->post('/{id}/send-to-cashier', [PatientWaitingTimesController::class, 'sendToCashier']);
        $router->post('/{id}/send-to-consultation', [PatientWaitingTimesController::class, 'sendToConsultation']);
        $router->post('/{id}/send-to-dispensing', [PatientWaitingTimesController::class, 'sendToDispensing']);
        $router->post('/{id}/send-to-procedure-room', [PatientWaitingTimesController::class, 'sendToProcedureRoom']);
        $router->post('/{id}/move-to-department', [PatientWaitingTimesController::class, 'moveToDepartment']);
    });
    
    // Doctor Tasks feature removed as per request
    /*
    $router->prefix('doctor-tasks')->group(function ($router) {
        $router->get('/', [DoctorTasksController::class, 'index']);
        $router->get('/statistics', [DoctorTasksController::class, 'statistics']);
        $router->get('/doctor/{doctorId}', [DoctorTasksController::class, 'doctorTasks']);
        $router->post('/', [DoctorTasksController::class, 'store']);
        $router->post('/{id}/start', [DoctorTasksController::class, 'startTask']);
        $router->post('/{id}/complete', [DoctorTasksController::class, 'completeTask']);
    });
    */
    
    $router->get('/dashboard', [DashboardController::class, '__invoke']);
    // Temporarily moved outside auth to test
    // $router->get('/notifications', [NotificationsController::class, '__invoke']);
    // $router->get('/notifications/dynamic', [NotificationsController::class, 'getDynamicNotifications']);
    
    // Patient Notifications
    $router->prefix('patient-notifications')->group(function ($router) {
        $router->get('/', [PatientNotificationsController::class, 'index']);
        $router->get('/unread-count', [PatientNotificationsController::class, 'unreadCount']);
        $router->post('/{id}/mark-as-read', [PatientNotificationsController::class, 'markAsRead']);
        $router->post('/mark-all-as-read', [PatientNotificationsController::class, 'markAllAsRead']);
        $router->delete('/{id}', [PatientNotificationsController::class, 'destroy']);
    });
    $router->get('/performance-reports/{department}', [PerformanceDashboardController::class, '__invoke']);
    $router->apiResource('/clinics', ClinicsController::class);
    $router->apiResource('/departments', DepartmentsController::class);
    $router->apiResource('/job-titles', JobTitlesController::class);
    $router->apiResource('/users', UsersController::class);
    $router->apiResource('/appointments', AppointmentsController::class)->except(['store']);
    $router->apiResource('/payment-modes', PaymentModesController::class);
    $router->apiResource('/payment-channels', PaymentChannelsController::class);
    // Units of measure - only CRUD operations (index is public)
    $router->post('/units-of-measure', [UnitsOfMeasureController::class, 'store']);
    $router->get('/units-of-measure/{id}', [UnitsOfMeasureController::class, 'show']);
    $router->put('/units-of-measure/{id}', [UnitsOfMeasureController::class, 'update']);
    $router->delete('/units-of-measure/{id}', [UnitsOfMeasureController::class, 'destroy']);
    $router->apiResource('/lens-types', LensTypesController::class);
    $router->apiResource('/item-types', ItemTypesController::class);
    $router->apiResource('/consultation-types', ConsultationTypesController::class);
    $router->apiResource('/items', ItemsController::class);
    $router->apiResource('/item-prices', ItemPricesController::class);
    $router->apiResource('/regions', RegionsController::class);
    $router->apiResource('/districts', DistrictsController::class);
    $router->apiResource('/wards', WardsController::class);
    $router->apiResource('/diseases', DiseasesController::class);
    $router->apiResource('/occupations', OccupationsController::class);
    
    // Office Calendar
    $router->prefix('office-calendar')->group(function ($router) {
        $router->get('/', [OfficeCalendarController::class, 'index']);
        $router->post('/', [OfficeCalendarController::class, 'store']);
        $router->get('/upcoming-reminders', [OfficeCalendarController::class, 'getUpcomingReminders']);
        
        // Newsletter Subscribers (GET only - POST is public) - Must be before /{id} route
        $router->get('/subscribers', [OfficeCalendarSubscribersController::class, 'index']);
        
        // Contact Submissions (GET only - POST is public) - Must be before /{id} route
        $router->get('/contact-submissions', [OfficeCalendarContactSubmissionsController::class, 'index']);
        
        $router->post('/{id}/mark-reminder-sent', [OfficeCalendarController::class, 'markReminderSent']);
        $router->get('/{id}', [OfficeCalendarController::class, 'show']);
        $router->put('/{id}', [OfficeCalendarController::class, 'update']);
        $router->delete('/{id}', [OfficeCalendarController::class, 'destroy']);
    });
    
    // Financial management routes - require financial_management privilege
    Route::group(['middleware' => ['auth:api', 'privilege:financial_management']], function ($router) {
        $router->controller(FinancialManagementReportsController::class)->prefix('financial-management')->group(function ($router) {
            $router->get('/dashboard', '__invoke');
            $router->get('/reports', 'index');
            $router->get('/reports/revenue-collection', 'getRevenueCollectionReport');
            $router->get('/reports/expenses', 'getExpenseReport');
        });
    });
    
    // Employee Reports
    $router->prefix('employee-reports')->group(function ($router) {
        $router->get('/my-reports', [EmployeeReportsController::class, 'myReports']);
        $router->post('/{id}/submit', [EmployeeReportsController::class, 'submit']);
        $router->post('/{id}/approve', [EmployeeReportsController::class, 'approve']);
        $router->post('/{id}/reject', [EmployeeReportsController::class, 'reject']);
        $router->get('/', [EmployeeReportsController::class, 'index']);
        $router->post('/', [EmployeeReportsController::class, 'store']);
        $router->get('/{id}', [EmployeeReportsController::class, 'show']);
        $router->put('/{id}', [EmployeeReportsController::class, 'update']);
        $router->delete('/{id}', [EmployeeReportsController::class, 'destroy']);
    });
    
    // External Links
    $router->prefix('external-links')->group(function ($router) {
        // Email Alerts
        $router->prefix('email-alerts')->group(function ($router) {
            $router->get('/settings', [ExternalLinksEmailAlertsController::class, 'getSettings']);
            $router->put('/settings', [ExternalLinksEmailAlertsController::class, 'updateSettings']);
        });
        
        // Website Appointments
        $router->prefix('website-appointments')->group(function ($router) {
            $router->get('/', [ExternalLinksWebsiteAppointmentsController::class, 'index']);
            $router->patch('/{id}', [ExternalLinksWebsiteAppointmentsController::class, 'update']);
        });
    });
    $router->get('/patients-to-return/this-week', [PatientsToReturnController::class, 'getThisWeek']);
    $router->get('/employee-sales-performance', [EmployeeSalesPerformanceController::class, 'getAllEmployeesSalesPerformance']);
    $router->get('/employee-sales-performance/{employeeId}', [EmployeeSalesPerformanceController::class, 'getEmployeeSalesPerformance']);
    $router->get('/lens-stock', [LensStockController::class, 'index']);
    $router->get('/lens-stock', [LensStockController::class, 'index']);

    $router->get('/patients/test', [PatientsController::class, 'test']);
    $router->apiResource('/patients', PatientsController::class);
    $router->apiResource('/patient-check-ins', PatientCheckInsController::class);
    $router->apiResource('/patient-attachments', PatientAttachmentsController::class);

    $router->apiResource('/patient-payment-cache', PatientPaymentCacheController::class);
    $router->apiResource('/patient-payment-cache-items', PatientPaymentCacheItemsController::class);
    $router->controller(PatientPaymentCacheItemsController::class)->prefix('patient-payment-cache-items')->group(function ($router) {
        $router->post('/make-cash-payment', 'makeCashPayment');
        $router->post('/approve-credit-payment', 'approveCreditPayment');
        $router->post('/create-bill', 'createBill');
        $router->post('/create-invoice', 'createInvoice');
        $router->post('/dispense', 'dispense');
        $router->post('/complete', 'complete');
    });
    $router->apiResource('/patient-item-payments', PatientItemPaymentsController::class);

    $router->apiResource('/patient-item-bills', PatientItemBillsController::class);
    $router->patch('/patient-item-bills/{id}/clear', [PatientItemBillsController::class, 'clear']);
    $router->apiResource('/patient-item-bill-payments', PatientItemBillPaymentsController::class);

    $router->apiResource('/consultations', ConsultationsController::class);
    $router->controller(ConsultationsController::class)->prefix('consultations')->group(function ($router) {
        $router->post('/add-item', 'addItem');
        $router->patch('/{id}/auto-save-clinical-notes', 'autoSaveClinicalNotes');
        $router->patch('/{id}/complete-clinical-notes', 'completeClinicalNotes');
    });
    $router->apiResource('/referrals', ReferralsController::class);
    $router->apiResource('/surgery-record-reports', SurgeryRecordReportsController::class);
    $router->apiResource('/cataract-surgery-records', CataractSurgeryRecordsController::class);

    $router->apiResource('/consultation-diagnoses', ConsultationDiagnosesController::class);
    $router->apiResource('/stocktakes', StocktakesController::class);
    $router->post('/stocktakes/{id}/apply', [StocktakesController::class, 'apply']);
    
    // Stock Alerts
    $router->prefix('stock-alerts')->group(function ($router) {
        $router->get('/out-of-stock', [StockAlertsController::class, 'getOutOfStockItems']);
        $router->get('/expired', [StockAlertsController::class, 'getExpiredItems']);
        $router->get('/expiring-soon', [StockAlertsController::class, 'getExpiringSoonItems']);
        $router->get('/summary', [StockAlertsController::class, 'getStockAlertsSummary']);
        $router->get('/medicine', [StockAlertsController::class, 'getMedicineAlerts']);
        $router->get('/medicine-summary', [StockAlertsController::class, 'getMedicineAlertsSummary']);
    });

    // Medicine Taking routes
    $router->group(['prefix' => 'medicine-taking'], function () use ($router) {
        $router->get('/', [MedicineTakingController::class, 'index']);
        $router->post('/', [MedicineTakingController::class, 'store']);
        $router->get('/{id}', [MedicineTakingController::class, 'show']);
        $router->put('/{id}', [MedicineTakingController::class, 'update']);
        $router->delete('/{id}', [MedicineTakingController::class, 'destroy']);
        $router->post('/{id}/mark-taken', [MedicineTakingController::class, 'markAsTaken']);
    });

    // Medicines routes
    $router->apiResource('/medicines', MedicinesController::class);
    $router->post('/medicines/bulk-create', [MedicinesController::class, 'bulkCreate']);
    $router->get('/medicines/selection', [MedicinesController::class, 'getForSelection']);

    $router->apiResource('/expense-categories', ExpenseCategoriesController::class);
    $router->apiResource('/expenses', ExpensesController::class);
    $router->apiResource('/expense-payments', ExpensePaymentsController::class);
    $router->apiResource('/preferences', PreferencesController::class);

    $router->get('/messages', [MessagesController::class, '__invoke']);

    $router->prefix('marketing')->group(function ($router) {
        $router->get('/dashboard', [MarketingDashboardController::class, '__invoke']);
        $router->apiResource('/daily-activities', DailyActivitiesController::class);
        $router->apiResource('/ideas', IdeasController::class);
        $router->apiResource('/events', EventsController::class);
        $router->apiResource('/research-plans', ResearchPlansController::class);
        $router->apiResource('/marketing-strategies', MarketingStrategiesController::class);
        $router->apiResource('/information-sources', InformationSourcesController::class);
        $router->apiResource('/communication-logs', CommunicationLogsController::class);
        
        // Bulk SMS
        $router->apiResource('/bulk-sms', BulkSmsController::class);
        $router->post('/bulk-sms/{id}/send', [BulkSmsController::class, 'send']);
        
        // WhatsApp Export
        $router->get('/whatsapp-export', [WhatsAppExportController::class, 'export']);
        
        // Unreachable Numbers
        $router->get('/unreachable-numbers', [UnreachableNumbersController::class, 'index']);
        
        // High Value Patients
        $router->get('/high-value-patients', [HighValuePatientsController::class, 'index']);
        
        // Prestige Clients
        $router->get('/prestige-clients', [PrestigeClientsController::class, 'index']);
        
        // Bulk SMS
        $router->apiResource('/bulk-sms', BulkSmsController::class);
        $router->post('/bulk-sms/{id}/send', [BulkSmsController::class, 'send']);
        
        // WhatsApp Export
        $router->get('/whatsapp-export', [WhatsAppExportController::class, 'export']);
        
        // Client Calling Status
        $router->get('/client-calling-status', [ClientCallingStatusController::class, 'index']);
        $router->match(['put', 'patch'], '/client-calling-status/{patientId}', [ClientCallingStatusController::class, 'update']);
        $router->post('/client-calling-status/bulk-update', [ClientCallingStatusController::class, 'bulkUpdate']);
        
        // Campaign Performance
        $router->get('/campaign-performance', [CampaignPerformanceController::class, 'index']);
        
        // Lead Generation
        $router->get('/lead-generation', [LeadGenerationController::class, 'index']);
        
        // Communication Analytics
        $router->get('/communication-analytics', [CommunicationAnalyticsController::class, 'index']);
    });
    
    $router->prefix('consultation-room')->group(function ($router) {
        $router->get('/dashboard', [ConsultationRoomDashboardController::class, '__invoke']);
    });
    
    $router->prefix('optician-center')->group(function ($router) {
        $router->get('/dashboard', [OpticianCenterDashboardController::class, '__invoke']);
    });
    
    $router->prefix('sales-center')->group(function ($router) {
        $router->get('/dashboard', [SalesCenterDashboardController::class, '__invoke']);
        $router->get('/prescriptions/summary', [SalesCenterPrescriptionsController::class, 'summary']);
        $router->get('/prescriptions', [SalesCenterPrescriptionsController::class, 'index']);
    });
    
    $router->prefix('sales-management')->group(function ($router) {
        $router->get('/dashboard', [SalesManagementDashboardController::class, '__invoke']);
        $router->get('/clinical-notes', [ConsultationsController::class, 'index']);
        $router->get('/patients-sent-to-sales', [PatientPaymentCacheController::class, 'index']);
    });
    
    $router->prefix('medicine-center')->group(function ($router) {
        $router->get('/dashboard', [MedicineCenterDashboardController::class, '__invoke']);
    });

    $router->prefix('other-dispensing')->group(function ($router) {
        $router->get('/dashboard', [OtherDispensingDashboardController::class, '__invoke']);
    });

    $router->prefix('dispensing')->group(function ($router) {
        $router->get('/dashboard', [\App\Http\Controllers\DispensingDashboardController::class, '__invoke']);
    });

    $router->prefix('inventory-management')->group(function ($router) {
        $router->get('/dashboard', [InventoryManagementDashboardController::class, '__invoke']);
    });

    $router->prefix('financial-management')->group(function ($router) {
        $router->get('/dashboard', [FinancialManagementDashboardController::class, '__invoke']);
    });

    $router->prefix('procedure-room')->group(function ($router) {
        $router->get('/dashboard', [ProcedureRoomDashboardController::class, '__invoke']);
    });

    $router->prefix('reception')->group(function ($router) {
        $router->get('/dashboard', [\App\Http\Controllers\ReceptionDashboardController::class, '__invoke']);
    });

    $router->prefix('payment-center')->group(function ($router) {
        $router->get('/dashboard', [\App\Http\Controllers\PaymentCenterDashboardController::class, '__invoke']);
    });

    $router->prefix('director')->group(function ($router) {
        $router->get('/dashboard', [DirectorDashboardController::class, '__invoke']);
        $router->get('/employee-performance', [EmployeePerformanceController::class, 'index']);
    });

    $router->prefix('dashboard')->group(function ($router) {
        $router->get('/performance/{department}', [PerformanceDashboardController::class, 'getDepartmentKPIs']);
        $router->patch('/performance/{department}/targets', [PerformanceDashboardController::class, 'updateTargets']);
    });

    $router->prefix('marketing')->group(function ($router) {
        $router->controller(\App\Http\Controllers\Marketing\ClientCallingStatusController::class)->group(function ($router) {
            $router->get('/client-calling-status', 'index');
            $router->post('/client-calling-status', 'store');
            $router->match(['put', 'patch'], '/client-calling-status/{patientId}', 'update');
            $router->delete('/client-calling-status/{id}', 'destroy');
            $router->get('/client-calling-stats', 'getCallingStats');
        });
    });

    $router->prefix('admin')->group(function ($router) {
        $router->controller(\App\Http\Controllers\Admin\DeleteTestUsersController::class)->group(function ($router) {
            $router->get('/test-users', 'index');
            $router->delete('/test-users', 'destroy');
        });
    });

    $router->prefix('reports')->group(function ($router) {
        $router->controller(PaymentCenterReportsController::class)->prefix('payment-center')->group(function ($router) {
            $router->get('/cash-collection', 'getCashCollectionReport');
            $router->get('/expenses', 'getExpenseReport');
        });
        $router->controller(InventoryManagementReportsController::class)->prefix('inventory-management')->group(function ($router) {
            $router->get('/item-quantity-dispensed', 'getItemQuantityDispensedReport');
            $router->get('/item-balance', 'getItemBalanceReport');
        });
        $router->controller(FinancialManagementReportsController::class)->prefix('financial-management')->group(function ($router) {
            $router->get('/dashboard', '__invoke');
            $router->get('/balance-sheet', 'getBalanceSheetReport');
        });
        // Sales report route removed - no longer needed
    });
});

// CRM Reports - Public endpoints for testing
Route::get('/crm-reports/marketing-contact-analytics', [CRMReportsController::class, 'marketingContactAnalytics']);
Route::get('/crm-reports/lead-conversion-report', [CRMReportsController::class, 'leadConversionReport']);

// Department Performance Report Cards
Route::group(['middleware' => 'auth:api'], function ($router) {
    $router->prefix('department-performance')->group(function ($router) {
        $router->get('/departments', [\App\Http\Controllers\DepartmentPerformanceController::class, 'getDepartments']);
        $router->get('/{department}', [\App\Http\Controllers\DepartmentPerformanceController::class, 'show']);
        $router->post('/{department}/generate', [\App\Http\Controllers\DepartmentPerformanceController::class, 'generate']);
        $router->patch('/{department}', [\App\Http\Controllers\DepartmentPerformanceController::class, 'update']);
        $router->get('/{department}/targets', [\App\Http\Controllers\DepartmentPerformanceController::class, 'getTargets']);
        $router->get('/{department}/audit-logs', [\App\Http\Controllers\DepartmentPerformanceController::class, 'getAuditLogs']);
        $router->post('/initialize', [\App\Http\Controllers\DepartmentPerformanceController::class, 'initialize']);
    });
});

Route::get('/restore', function (\Illuminate\Http\Request $request) {
    $items = \Illuminate\Support\Facades\DB::select('select message, phone, patient_id from messages group by patient_id');

    foreach ($items as &$item) {
        $pattern = '/Habari\s+(.+?)\./';
        if (preg_match($pattern, $item->message, $matches)) {
            $first_name = trim($matches[1]);
            \App\Models\Patient::where('id', $item->patient_id)->where('first_name', '')->update(['first_name' => $first_name, 'phone' => $item->phone]);
        }
    }
});
