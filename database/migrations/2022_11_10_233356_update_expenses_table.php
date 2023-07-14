202<?php

use Carbon\Carbon;
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
        $now = Carbon::now()->format('Y-m-d H:i:s');
        $expenses = DB::select('select * from expenses where 1');
        foreach ($expenses as &$expense) {
            DB::insert('insert into expense_payments(expense_id, amount, created_at, created_by, updated_at) values (?, ?, ?, ?, ?)', [$expense->id, $expense->paid_amount, $expense->updated_at, $expense->created_by, $now]);
        }

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn('paid_amount');
        });
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
