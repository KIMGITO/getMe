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
        Schema::create('shopping_lists', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('client_id')->constrained('users');
            $table->string('title')->nullable();
            $table->enum('statue', ['draft', 'created', 'assigned', 'delivered'])->default('draft');
            $table->timestamp('submitted_at')->default(now());
            $table->timestamp('preferred_pickup_start_time')->nullable();
            $table->decimal('total_estimated_cost', 10, 2);
            $table->decimal('total_actual_cost', 10, 2)->default(0);
            $table->foreignUlid('delivery_address_id')->nullable()->constrained('addresses', 'id');
            $table->foreignUlid('rider_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('note_for_rider')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shopping_lists');
    }
};
