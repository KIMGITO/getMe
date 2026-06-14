<?php

use App\Enums\RiderActivityStatus;
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
        Schema::create('rider_profiles', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->onDelete('cascade');
            // Identity & Compliance
            $table->string('id_number')->unique();
            $table->string('id_front_path')->nullable();
            $table->string('id_back_path')->nullable();

            // activity status
            $table->enum('activity_status', array_column(RiderActivityStatus::cases(), 'value'))->default(RiderActivityStatus::STATUS_IDLE->value);
            // sacco    
            $table->string('sacco_name')->nullable();
            $table->string('sacco_membership_number')->nullable();

            // Vehicle Details
            $table->string('vehicle_type'); // e.g., Bike, Car, Van
            $table->string('vehicle_plate_number')->unique();
            $table->string('vehicle_model')->nullable();

            // Status & Logic Control
            $table->boolean('is_active')->default(false);      // Available for deliveries
            $table->boolean('is_suspended')->default(false);   // Temporary block
            $table->boolean('is_blacklisted')->default(false); // Permanent ban
            $table->string('suspension_reason')->nullable();

            $table->boolean('is_verified')->false();

            $table->timestamps();
            $table->index('vehicle_plate_number');
            $table->index('sacco_membership_number');

            $table->string('current_order_id')->nullable();
            $table->timestamp('assigned_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rider_profiles');
    }
};
