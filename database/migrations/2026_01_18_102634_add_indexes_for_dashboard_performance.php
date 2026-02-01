<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Check if an index exists on a table
     */
    private function indexExists($tableName, $indexName)
    {
        $result = DB::selectOne("
            SELECT COUNT(*) as count
            FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
            AND INDEX_NAME = ?
        ", [$tableName, $indexName]);

        return $result && $result->count > 0;
    }

    public function up()
    {
        // Add indexes for patient_item_payments table
        if (Schema::hasTable('patient_item_payments')) {
            Schema::table('patient_item_payments', function (Blueprint $table) {
                if (Schema::hasColumn('patient_item_payments', 'created_at') && !$this->indexExists('patient_item_payments', 'pip_created_at_index')) {
                    $table->index('created_at');
                }

                if (Schema::hasColumn('patient_item_payments', 'created_by') && !$this->indexExists('patient_item_payments', 'pip_created_by_index')) {
                    $table->index('created_by');
                }

                if (Schema::hasColumn('patient_item_payments', 'channel_id') && !$this->indexExists('patient_item_payments', 'pip_channel_id_index')) {
                    $table->index('channel_id');
                }
            });
        }

        // Add indexes for patient_item_bill_payments table
        if (Schema::hasTable('patient_item_bill_payments')) {
            Schema::table('patient_item_bill_payments', function (Blueprint $table) {
                if (Schema::hasColumn('patient_item_bill_payments', 'created_at') && !$this->indexExists('patient_item_bill_payments', 'pibp_created_at_index')) {
                    $table->index('created_at');
                }

                if (Schema::hasColumn('patient_item_bill_payments', 'created_by') && !$this->indexExists('patient_item_bill_payments', 'pibp_created_by_index')) {
                    $table->index('created_by');
                }

                if (Schema::hasColumn('patient_item_bill_payments', 'channel_id') && !$this->indexExists('patient_item_bill_payments', 'pibp_channel_id_index')) {
                    $table->index('channel_id');
                }
            });
        }

        // Add indexes for expense_payments table
        if (Schema::hasTable('expense_payments')) {
            Schema::table('expense_payments', function (Blueprint $table) {
                if (Schema::hasColumn('expense_payments', 'created_at') && !$this->indexExists('expense_payments', 'ep_created_at_index')) {
                    $table->index('created_at');
                }

                if (Schema::hasColumn('expense_payments', 'created_by') && !$this->indexExists('expense_payments', 'ep_created_by_index')) {
                    $table->index('created_by');
                }

                if (Schema::hasColumn('expense_payments', 'expense_id') && !$this->indexExists('expense_payments', 'ep_expense_id_index')) {
                    $table->index('expense_id');
                }
            });
        }

        // Add indexes for patients table
        if (Schema::hasTable('patients')) {
            Schema::table('patients', function (Blueprint $table) {
                if (Schema::hasColumn('patients', 'created_at') && !$this->indexExists('patients', 'patients_created_at_index')) {
                    $table->index('created_at');
                }

                if (Schema::hasColumn('patients', 'creator_id') && !$this->indexExists('patients', 'patients_creator_id_index')) {
                    $table->index('creator_id');
                }

                if (Schema::hasColumn('patients', 'gender') && !$this->indexExists('patients', 'patients_gender_index')) {
                    $table->index('gender');
                }

                if (Schema::hasColumn('patients', 'information_source_id') && !$this->indexExists('patients', 'patients_info_source_id_index')) {
                    $table->index('information_source_id');
                }
            });
        }

        // Add indexes for patient_check_ins table
        if (Schema::hasTable('patient_check_ins')) {
            Schema::table('patient_check_ins', function (Blueprint $table) {
                if (Schema::hasColumn('patient_check_ins', 'created_at') && !$this->indexExists('patient_check_ins', 'pci_created_at_index')) {
                    $table->index('created_at');
                }

                if (Schema::hasColumn('patient_check_ins', 'patient_id') && !$this->indexExists('patient_check_ins', 'pci_patient_id_index')) {
                    $table->index('patient_id');
                }

                if (Schema::hasColumn('patient_check_ins', 'creator_id') && !$this->indexExists('patient_check_ins', 'pci_creator_id_index')) {
                    $table->index('creator_id');
                }
            });
        }

        // Add indexes for consultations table
        if (Schema::hasTable('consultations')) {
            Schema::table('consultations', function (Blueprint $table) {
                if (Schema::hasColumn('consultations', 'patient_direction') && !$this->indexExists('consultations', 'consultations_patient_direction_index')) {
                    $table->index('patient_direction');
                }

                if (Schema::hasColumn('consultations', 'status') && !$this->indexExists('consultations', 'consultations_status_index')) {
                    $table->index('status');
                }

                if (Schema::hasColumn('consultations', 'payment_cache_item_id') && !$this->indexExists('consultations', 'consultations_payment_cache_item_id_index')) {
                    $table->index('payment_cache_item_id');
                }

                if (Schema::hasColumn('consultations', 'created_by') && !$this->indexExists('consultations', 'consultations_created_by_index')) {
                    $table->index('created_by');
                }
            });
        }

        // Add indexes for patient_payment_cache_items table
        if (Schema::hasTable('patient_payment_cache_items')) {
            Schema::table('patient_payment_cache_items', function (Blueprint $table) {
                if (Schema::hasColumn('patient_payment_cache_items', 'status') && !$this->indexExists('patient_payment_cache_items', 'ppci_status_index')) {
                    $table->index('status');
                }

                if (Schema::hasColumn('patient_payment_cache_items', 'bill_id') && !$this->indexExists('patient_payment_cache_items', 'ppci_bill_id_index')) {
                    $table->index('bill_id');
                }

                if (Schema::hasColumn('patient_payment_cache_items', 'item_id') && !$this->indexExists('patient_payment_cache_items', 'ppci_item_id_index')) {
                    $table->index('item_id');
                }

                if (Schema::hasColumn('patient_payment_cache_items', 'consultation_type_id') && !$this->indexExists('patient_payment_cache_items', 'ppci_consultation_type_id_index')) {
                    $table->index('consultation_type_id');
                }

                if (Schema::hasColumn('patient_payment_cache_items', 'created_at') && !$this->indexExists('patient_payment_cache_items', 'ppci_created_at_index')) {
                    $table->index('created_at');
                }

                if (Schema::hasColumn('patient_payment_cache_items', 'served_at') && !$this->indexExists('patient_payment_cache_items', 'ppci_served_at_index')) {
                    $table->index('served_at');
                }

                if (Schema::hasColumn('patient_payment_cache_items', 'creator_id') && !$this->indexExists('patient_payment_cache_items', 'ppci_creator_id_index')) {
                    $table->index('creator_id');
                }
            });
        }

        // Add indexes for patient_item_bills table
        if (Schema::hasTable('patient_item_bills')) {
            Schema::table('patient_item_bills', function (Blueprint $table) {
                if (Schema::hasColumn('patient_item_bills', 'status') && !$this->indexExists('patient_item_bills', 'pib_status_index')) {
                    $table->index('status');
                }

                if (Schema::hasColumn('patient_item_bills', 'creator_id') && !$this->indexExists('patient_item_bills', 'pib_creator_id_index')) {
                    $table->index('creator_id');
                }
            });
        }

        // Add indexes for expenses table
        if (Schema::hasTable('expenses')) {
            Schema::table('expenses', function (Blueprint $table) {
                if (Schema::hasColumn('expenses', 'category_id') && !$this->indexExists('expenses', 'expenses_category_id_index')) {
                    $table->index('category_id');
                }
            });
        }

        // Add indexes for consultation_diagnoses table
        if (Schema::hasTable('consultation_diagnoses')) {
            Schema::table('consultation_diagnoses', function (Blueprint $table) {
                if (Schema::hasColumn('consultation_diagnoses', 'disease_id') && !$this->indexExists('consultation_diagnoses', 'cd_disease_id_index')) {
                    $table->index('disease_id');
                }

                if (Schema::hasColumn('consultation_diagnoses', 'consultation_id') && !$this->indexExists('consultation_diagnoses', 'cd_consultation_id_index')) {
                    $table->index('consultation_id');
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
        // Remove indexes only if they exist
        $tables = [
            'patient_item_payments' => ['pip_created_at_index', 'pip_created_by_index', 'pip_channel_id_index'],
            'patient_item_bill_payments' => ['pibp_created_at_index', 'pibp_created_by_index', 'pibp_channel_id_index'],
            'expense_payments' => ['ep_created_at_index', 'ep_created_by_index', 'ep_expense_id_index'],
            'patients' => ['patients_created_at_index', 'patients_creator_id_index', 'patients_gender_index', 'patients_info_source_id_index'],
            'patient_check_ins' => ['pci_created_at_index', 'pci_patient_id_index', 'pci_creator_id_index'],
            'consultations' => ['consultations_patient_direction_index', 'consultations_status_index', 'consultations_payment_cache_item_id_index', 'consultations_created_by_index'],
            'patient_payment_cache_items' => ['ppci_status_index', 'ppci_bill_id_index', 'ppci_item_id_index', 'ppci_consultation_type_id_index', 'ppci_created_at_index', 'ppci_served_at_index', 'ppci_creator_id_index'],
            'patient_item_bills' => ['pib_status_index', 'pib_creator_id_index'],
            'expenses' => ['expenses_category_id_index'],
            'consultation_diagnoses' => ['cd_disease_id_index', 'cd_consultation_id_index'],
        ];

        foreach ($tables as $tableName => $indexes) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) use ($indexes) {
                    foreach ($indexes as $indexName) {
                        try {
                            $table->dropIndex($indexName);
                        } catch (\Exception $e) {
                            // Index might not exist, continue
                        }
                    }
                });
            }
        }
    }
};