<?php

namespace App\Enums;

enum OrderStatus: string
{
    // Initial states
    case PENDING = 'pending';
    case CONFIRMED = 'confirmed';

    // Auto-selection states (NEW)
    case SEARCHING_FOR_RIDER = 'searching_for_rider';
    case RIDER_SELECTED = 'rider_selected';     // Rider auto-selected, waiting for client confirmation
    case RIDER_ASSIGNED = 'rider_assigned';     // Client confirmed the rider

    // Legacy bidding states (keep for backward compatibility)
    case BIDDING = 'bidding';
    case BID_SELECTED = 'bid_selected';

    // Delivery states
    case ASSIGNED = 'assigned';
    case PICKED_UP = 'picked_up';
    case IN_TRANSIT = 'in_transit';
    case DELIVERED = 'delivered';

    // Cancellation states (NEW)
    case CANCELLED_BY_CLIENT = 'cancelled_by_client';
    case CANCELLED_BY_RIDER = 'cancelled_by_rider';
    case CANCELLED_BY_SYSTEM = 'cancelled_by_system';  // No riders available or timeout

    // Completion/Issue states
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';      // Generic cancelled (legacy)
    case REFUNDED = 'refunded';
    case FAILED = 'failed';

    /**
     * Get the label for the status
     */
    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::CONFIRMED => 'Confirmed',

            // Auto-selection states
            self::SEARCHING_FOR_RIDER => 'Searching for Rider',
            self::RIDER_SELECTED => 'Rider Selected - Awaiting Your Confirmation',
            self::RIDER_ASSIGNED => 'Rider Assigned',

            // Legacy bidding states
            self::BIDDING => 'Open for Bidding',
            self::BID_SELECTED => 'Bid Selected',

            // Delivery states
            self::ASSIGNED => 'Rider Assigned',
            self::PICKED_UP => 'Order Picked Up',
            self::IN_TRANSIT => 'In Transit',
            self::DELIVERED => 'Delivered',

            // Cancellation states
            self::CANCELLED_BY_CLIENT => 'Cancelled by Customer',
            self::CANCELLED_BY_RIDER => 'Cancelled by Rider',
            self::CANCELLED_BY_SYSTEM => 'Cancelled - No Riders Available',

            // Completion/Issue states
            self::COMPLETED => 'Completed',
            self::CANCELLED => 'Cancelled',
            self::REFUNDED => 'Refunded',
            self::FAILED => 'Failed',
        };
    }

    /**
     * Get the color class for the status (for UI)
     */
    public function color(): string
    {
        return match ($this) {
            self::PENDING, self::CONFIRMED, self::SEARCHING_FOR_RIDER => 'yellow',
            self::RIDER_SELECTED => 'orange',
            self::RIDER_ASSIGNED, self::ASSIGNED => 'blue',
            self::PICKED_UP, self::IN_TRANSIT => 'indigo',
            self::DELIVERED, self::COMPLETED => 'green',
            self::BIDDING, self::BID_SELECTED => 'purple',
            self::CANCELLED_BY_CLIENT, self::CANCELLED_BY_RIDER,
            self::CANCELLED_BY_SYSTEM, self::CANCELLED, self::FAILED => 'red',
            self::REFUNDED => 'gray',
        };
    }

    /**
     * Get icon class for the status
     */
    public function icon(): string
    {
        return match ($this) {
            self::PENDING => 'fa-clock',
            self::CONFIRMED => 'fa-check-circle',
            self::SEARCHING_FOR_RIDER => 'fa-search',
            self::RIDER_SELECTED => 'fa-user-clock',
            self::RIDER_ASSIGNED, self::ASSIGNED => 'fa-motorcycle',
            self::PICKED_UP => 'fa-box',
            self::IN_TRANSIT => 'fa-truck',
            self::DELIVERED => 'fa-check-double',
            self::COMPLETED => 'fa-star',
            self::BIDDING => 'fa-gavel',
            self::BID_SELECTED => 'fa-handshake',
            self::CANCELLED_BY_CLIENT => 'fa-user-slash',
            self::CANCELLED_BY_RIDER => 'fa-user-slash',
            self::CANCELLED_BY_SYSTEM => 'fa-robot',
            self::CANCELLED => 'fa-ban',
            self::REFUNDED => 'fa-money-bill-wave',
            self::FAILED => 'fa-exclamation-triangle',
        };
    }

    /**
     * Check if order is in a cancellable state
     */
    public function isCancellable(): bool
    {
        return in_array($this, [
            self::PENDING,
            self::CONFIRMED,
            self::SEARCHING_FOR_RIDER,
            self::RIDER_SELECTED,
            self::BIDDING,
            self::BID_SELECTED,
        ]);
    }

    /**
     * Check if order is in a state where rider can cancel
     */
    public function canRiderCancel(): bool
    {
        return in_array($this, [
            self::RIDER_SELECTED,
            self::RIDER_ASSIGNED,
            self::ASSIGNED,
            self::BID_SELECTED,
        ]);
    }

    /**
     * Check if order is in a state where client can reject/replace rider
     */
    public function canClientRejectRider(): bool
    {
        return in_array($this, [
            self::RIDER_SELECTED,
            self::BID_SELECTED,
        ]);
    }

    /**
     * Check if order is active (not finished or cancelled)
     */
    public function isActive(): bool
    {
        return ! in_array($this, [
            self::DELIVERED,
            self::COMPLETED,
            self::CANCELLED,
            self::CANCELLED_BY_CLIENT,
            self::CANCELLED_BY_RIDER,
            self::CANCELLED_BY_SYSTEM,
            self::REFUNDED,
            self::FAILED,
        ]);
    }

    /**
     * Check if order is waiting for client action
     */
    public function requiresClientAction(): bool
    {
        return in_array($this, [
            self::RIDER_SELECTED,
            self::BID_SELECTED,
        ]);
    }

    /**
     * Check if order is waiting for rider action
     */
    public function requiresRiderAction(): bool
    {
        return in_array($this, [
            self::ASSIGNED,
            self::RIDER_ASSIGNED,
        ]);
    }

    /**
     * Get next status in normal flow
     */
    public function nextStatus(): ?self
    {
        return match ($this) {
            self::PENDING => self::SEARCHING_FOR_RIDER,
            self::SEARCHING_FOR_RIDER => self::RIDER_SELECTED,
            self::RIDER_SELECTED => self::RIDER_ASSIGNED,
            self::RIDER_ASSIGNED => self::PICKED_UP,
            self::ASSIGNED => self::PICKED_UP,
            self::PICKED_UP => self::IN_TRANSIT,
            self::IN_TRANSIT => self::DELIVERED,
            self::DELIVERED => self::COMPLETED,
            default => null,
        };
    }

    /**
     * Get all statuses for dropdown menus
     */
    public static function getSelectOptions(): array
    {
        $options = [];
        foreach (self::cases() as $case) {
            $options[$case->value] = $case->label();
        }

        return $options;
    }

    /**
     * Get active statuses only
     */
    public static function getActiveStatuses(): array
    {
        return array_filter(self::cases(), function ($status) {
            return $status->isActive();
        });
    }

    /**
     * Get delivery statuses
     */
    public static function getDeliveryStatuses(): array
    {
        return [
            self::ASSIGNED,
            self::RIDER_ASSIGNED,
            self::PICKED_UP,
            self::IN_TRANSIT,
            self::DELIVERED,
        ];
    }

    /**
     * Get cancellation statuses
     */
    public static function getCancellationStatuses(): array
    {
        return [
            self::CANCELLED_BY_CLIENT,
            self::CANCELLED_BY_RIDER,
            self::CANCELLED_BY_SYSTEM,
            self::CANCELLED,
        ];
    }

    /**
     * Get label
     */


 

    /**
     * Get human-readable group name
     */
    public function group(): string
    {
        return match ($this) {
            self::PENDING, self::CONFIRMED, self::SEARCHING_FOR_RIDER => 'Order Processing',
            self::RIDER_SELECTED, self::BIDDING, self::BID_SELECTED => 'Rider Selection',
            self::RIDER_ASSIGNED, self::ASSIGNED, self::PICKED_UP, self::IN_TRANSIT => 'Delivery In Progress',
            self::DELIVERED, self::COMPLETED => 'Completed',
            self::CANCELLED_BY_CLIENT, self::CANCELLED_BY_RIDER,
            self::CANCELLED_BY_SYSTEM, self::CANCELLED => 'Cancelled',
            self::REFUNDED, self::FAILED => 'Issue',
        };
    }

    /**
     * Get estimated time remaining based on status
     */
    public function estimatedTimeRemaining(): ?string
    {
        return match ($this) {
            self::PENDING, self::CONFIRMED, self::SEARCHING_FOR_RIDER => '2-5 minutes',
            self::RIDER_SELECTED => 'Waiting for confirmation',
            self::RIDER_ASSIGNED, self::ASSIGNED => 'Rider en route to pickup',
            self::PICKED_UP => '15-30 minutes',
            self::IN_TRANSIT => '5-15 minutes',
            self::DELIVERED => 'Completed',
            default => null,
        };
    }
}
