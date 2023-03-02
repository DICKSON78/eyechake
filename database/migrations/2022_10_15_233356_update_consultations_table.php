202<?php

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
        Schema::table('consultations', function (Blueprint $table) {
            $table->enum('patient_direction', ['Direct to Doctor', 'Direct to Optician'])->default('Direct to Doctor')->after('payment_cache_item_id');
            $table->dropColumn('optician_status');
            $table->enum('require_glass', ['Yes', 'No'])->default('No')->after('status');
        });

        DB::update('update consultations set patient_direction = concat("Direct to ", consultant)');

        Schema::table('consultations', function (Blueprint $table) {
            $table->dropColumn('consultant');
        });

        $consultations = DB::select('select * from consultations where sent_to_optician_at is not null');
        foreach ($consultations as &$consultation) {
            DB::update('update consultations set require_glass = "Yes" where id = ?', [$consultation->id]);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
};
