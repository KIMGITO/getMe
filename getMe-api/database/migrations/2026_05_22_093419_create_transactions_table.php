<?php

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
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
        Schema::create('transactions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('reference_id');
            $table->string('transaction_code')->nullable()->unique();
            $table->decimal('amount', 10, 2);
            $table->enum('type',  array_column(TransactionType::cases(), 'value'));
            $table->enum('status', array_column(TransactionStatus::cases(), 'value'))->default(TransactionStatus::PENDING->value);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
