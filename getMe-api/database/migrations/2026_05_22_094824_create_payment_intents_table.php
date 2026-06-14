<?php

use App\Enums\Gateways;
use App\Enums\PaymentIntentStatus;
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
        Schema::create('payment_intents', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('transaction_id')->constrained('transactions')->cascadeOnDelete();
            $table->enum('gateway', array_column(Gateways::cases(), 'value'))->default(Gateways::MPESA->value);
            $table->string('gateway_ref')->nullable();
            $table->decimal('external_amount', 10, 2);
            $table->decimal('gateway_fee', 10, 2)->nullable();
            $table->decimal('net_amount', 10, 2)->default(0);
            $table->enum('status',  array_column(PaymentIntentStatus::cases(), 'value'))->default(PaymentIntentStatus::PENDING->value);
            $table->json('gateway_response')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_intents');
    }
};
