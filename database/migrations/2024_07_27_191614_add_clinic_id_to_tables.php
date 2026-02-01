<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('rename table clinic_details to clinics');

        Schema::table('clinics', function (Blueprint $table) {
            if (!Schema::hasColumn('clinics', 'sms_key')) {
                if (Schema::hasColumn('clinics', 'sms_balance')) {
                    $table->string('sms_key')->nullable()->after('sms_balance');
                } else {
                    $table->string('sms_key')->nullable();
                }
            }
            if (!Schema::hasColumn('clinics', 'logo')) {
                if (Schema::hasColumn('clinics', 'sms_key')) {
                    $table->string('logo')->nullable()->after('sms_key');
                } else {
                    $table->string('logo')->nullable();
                }
            }
        });

        $sms_key = env('SMS_KEY');
        if ($sms_key) {
            DB::statement('update clinics set sms_key = ?', [env('SMS_KEY')]);
        }

        // DB::statement('alter table preferences drop primary key');

        // Only modify preferences table if it doesn't already have an id column
        if (!Schema::hasColumn('preferences', 'id')) {
            Schema::table('preferences', function (Blueprint $table) {
                $table->dropPrimary();
            });
            Schema::table('preferences', function (Blueprint $table) {
                $table->id()->autoIncrement()->first();
            });
        }

        $table_names = ['departments', 'users', 'expense_categories', 'information_sources', 'items', 'job_titles', 'payment_channels', 'payment_modes', 'preferences'];

        foreach ($table_names as $table_name) {
            Schema::table($table_name, function (Blueprint $table) use ($table_name) {
                if (!Schema::hasColumn($table_name, 'clinic_id')) {
                    $table->foreignId('clinic_id')->nullable()->after('id');

                    $table->foreign('clinic_id')
                        ->references('id')
                        ->on('clinics')
                        ->cascadeOnUpdate()
                        ->nullOnDelete();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tables', function (Blueprint $table) {
            //
        });
    }
};
