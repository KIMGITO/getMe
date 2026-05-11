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
        Schema::create('client_profiles', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->unique()->constrained()->onDelete('cascade');
            // Identity
            $table->string('profile_photo_path')->nullable();
            $table->boolean('is_verified')->default(false);

            // Physical Info & Logistics

            // Preferences
            $table->boolean('notifications_enabled')->default(true);
            $table->string('preferred_payment_method')->default('mpesa');
            $table->string('language')->default('english');

            // Safety
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();

            // Reliability & Finance
            $table->unsignedInteger('total_requests')->default(0);
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->decimal('total_spent', 12, 2)->default(0.00);

            // Admin Controls
            $table->boolean('is_blocked')->default(false);
            $table->text('block_reason')->nullable();
            $table->timestamp('last_active_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
