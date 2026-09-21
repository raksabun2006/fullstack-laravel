<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('currency', 10)->default('USD')->after('amount');
            $table->string('transaction_id')->nullable()->after('transaction_ref');
            $table->string('transaction_hash')->nullable()->after('transaction_id');
            $table->text('khqr')->nullable()->after('transaction_hash');
            $table->string('md5', 64)->nullable()->index()->after('khqr');
            $table->timestamp('paid_at')->nullable()->after('md5');
            $table->timestamp('expires_at')->nullable()->after('paid_at');
            $table->text('failure_reason')->nullable()->after('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'currency',
                'transaction_id',
                'transaction_hash',
                'khqr',
                'md5',
                'paid_at',
                'expires_at',
                'failure_reason',
            ]);
        });
    }
};
