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
        Schema::create('ledger_snapshots', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('ledger_account_id')->constrained('ledger_accounts')->cascadeOnDelete();
            $table->decimal('closing_balance', 15, 2);
            $table->date('snapshot_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ledger_snapshots');
    }
};
