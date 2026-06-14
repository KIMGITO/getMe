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
        Schema::create('shopping_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('shopping_list_id')->constrained('shopping_lists')->cascadeOnDelete();
            $table->string('shop')->nullable();
            $table->string('product_name');
            $table->string('unit');
            $table->decimal('quantity');
            $table->decimal('estimated_price_per_unit', 10, 2)->default(0);
            $table->decimal('actual_price_per_unit', 10, 2)->default(0);
            $table->boolean('is_picked')->default(false);
            $table->boolean('substitute_allowed')->default(true);
            $table->string('substitute_reason')->nullable();
            $table->text('photo_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shopping_items');
    }
};
