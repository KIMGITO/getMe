<?php

use App\Enums\OrderStatus;
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
        Schema::create('orders', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('order_number')->unique();
            $table->foreignUlid('shopping_list_id')->constrained('shopping_lists');
            $table->foreignUlid('client_id')->constrained('users', 'id');
            $table->foreignUlid('source_location')->nullable();
            $table->foreignUlid('delivery_location')->nullable();
            $table->foreignUlid('rider_id')->nullable()->constrained('users', 'id');
            $table->enum('order_status', array_column(OrderStatus::cases(), 'value'))->default(OrderStatus::PENDING->value);
            $table->enum('payment_status', ['unpaid', 'authorized', 'paid', 'failed'])->default('unpaid');
            $table->decimal('service_fee', 10, 2)->default(0);
            $table->decimal('delivery_fee', 10, 2)->default(0);
            $table->decimal('tip_amount', 10, 2)->default(0);
            $table->decimal('items_cost', 10, 2)->default(0);
            $table->decimal('total_charged', 10, 2)->default(0);
            $table->dateTime('rider_pickup_confirmed_at')->nullable();
            $table->dateTime('rider_delivered_at')->nullable();
            $table->integer('client_rating')->default(5);
            $table->integer('rider_rating')->default(5);
            $table->text('rider_feedback')->nullable();
            $table->text('client_feedback')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
