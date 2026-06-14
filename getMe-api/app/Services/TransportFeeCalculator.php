<?php

namespace App\Services;

class TransportFeeCalculator
{
    // ECONOMIC CONSTANTS
    private const FUEL_PRICE_PER_LITER = 240;

    private const MOTORBIKE_FUEL_KM_PER_LITER = 35;

    // RIDER COSTS
    private const RIDER_BASE_HOURLY_RATE = 150;

    private const AVERAGE_SPEED_KMPH = 25;

    // DELIVERY DISTANCE RATES (Market → Customer)
    private const BASE_DELIVERY_FEE = 80;

    private const PER_KM_RATE_STANDARD = 45;

    private const PER_KM_RATE_SHORT = 55;           // Under 3km

    private const PER_KM_RATE_LONG = 40;             // Over 10km

    private const SHORT_DISTANCE_MAX = 4;

    private const LONG_DISTANCE_START = 10;

    // PREMIUM DISTANCE (for long deliveries)
    private const PREMIUM_NOTIFY_KM = 8;

    private const PREMIUM_RATE_PER_KM_EXTRA = 10;

    // ==========================================
    //  (SHOPPING FEE)
    // ==========================================
    private const SHOPPING_BASE_FEE = 45;            // Minimum rider gets for shopping

    private const SHOPPING_PER_ITEM_RATE = 2;        // Extra KSH per item

    private const SHOPPING_BULKY_EXTRA = 20;          // Extra per bulky item

    private const SHOPPING_MAX_FEE = 300;             // Maximum shopping fee

    // FUEL SURCHARGE
    private const FUEL_BASE_PRICE = 200;

    private const FUEL_SURCHARGE_PERCENT = 0.15;

    // WAITING TIME (at market)
    private const WAITING_FREE_MINUTES = 5;

    private const WAITING_RATE_PER_MINUTE = 5;

    // REMOTE DELIVERY
    private const REMOTE_ZONE_EXTRA_PERCENT = 20;

    private const REMOTE_THRESHOLD_KM = 7.5;

    // BUILDING ACCESS
    private const NO_ELEVATOR_FEE = 20;

    private const NO_ELEVATOR_START_FLOOR = 3;

    // TIME OF DAY
    private const NIGHT_MULTIPLIER = 1.25;

    private const RAIN_MULTIPLIER = 1.15;

    // PLATFORM MARGIN (Platform profit from delivery)
    private const PLATFORM_MARGIN_PERCENT = 15;

    private const MARGIN_MIN = 20;

    private const MARGIN_MAX = 1000000;

    // CANCELLATION FEES
    private const CANCELLATION_FEE_AFTER_DISPATCH = 60;

    private const CANCELLATION_FEE_AT_MARKET = 100;

    // Properties
    private float $distanceKm;

    private int $itemCount;

    private int $bulkyItemCount;

    private int $waitingMinutes;

    private bool $isRemoteZone;

    private int $floorNumber;

    private bool $hasElevator;

    private bool $isNightTime;

    private bool $isRaining;

    private bool $isCancelled;

    private string $cancellationStage;

    private float $currentFuelPrice;

    // Calculated values
    private float $effectivePerKmRate;

    private float $shoppingFee;          // Rider gets this for shopping

    private float $deliveryFee;          // Rider gets this for distance

    private float $fuelSurcharge;

    private float $premiumFee;

    private float $waitingFee;

    private float $remoteExtra;

    private float $buildingFee;

    private float $multiplierFee;

    private float $totalRiderPayout;

    private float $platformMargin;

    private float $customerTotal;

    private array $breakdown = [];

    public function __construct()
    {
        $this->reset();
    }

    public function reset(): self
    {
        $this->distanceKm = 0;
        $this->itemCount = 0;
        $this->bulkyItemCount = 0;
        $this->waitingMinutes = 0;
        $this->isRemoteZone = false;
        $this->floorNumber = 1;
        $this->hasElevator = true;
        $this->isNightTime = false;
        $this->isRaining = false;
        $this->isCancelled = false;
        $this->cancellationStage = 'none';
        $this->currentFuelPrice = self::FUEL_PRICE_PER_LITER;

        $this->effectivePerKmRate = self::PER_KM_RATE_STANDARD;
        $this->shoppingFee = 0;
        $this->deliveryFee = 0;
        $this->fuelSurcharge = 0;
        $this->premiumFee = 0;
        $this->waitingFee = 0;
        $this->remoteExtra = 0;
        $this->buildingFee = 0;
        $this->multiplierFee = 0;
        $this->totalRiderPayout = 0;
        $this->platformMargin = 0;
        $this->customerTotal = 0;
        $this->breakdown = [];

        return $this;
    }

    /**
     * Calculate Shopping Fee (Service Fee) - What rider gets for picking items
     * Formula: Base 45 KSH + (items × 2 KSH) + (bulky items × 20 KSH)
     * Minimum: 45 KSH, Maximum: 300 KSH
     */
    private function calculateShoppingFee(): float
    {
        $calculatedFee = self::SHOPPING_BASE_FEE
            + ($this->itemCount * self::SHOPPING_PER_ITEM_RATE)
            + ($this->bulkyItemCount * self::SHOPPING_BULKY_EXTRA);

        // Apply min/max
        $finalFee = max(self::SHOPPING_BASE_FEE, min(self::SHOPPING_MAX_FEE, $calculatedFee));
        $finalFee = round($finalFee, 0);

        $this->shoppingFee = $finalFee;
        $this->breakdown['shopping_fee'] = $this->shoppingFee;
        $this->breakdown['shopping_fee_details'] = [
            'base' => self::SHOPPING_BASE_FEE,
            'items' => $this->itemCount,
            'item_component' => $this->itemCount * self::SHOPPING_PER_ITEM_RATE,
            'bulky_items' => $this->bulkyItemCount,
            'bulky_component' => $this->bulkyItemCount * self::SHOPPING_BULKY_EXTRA,
            'calculated' => $calculatedFee,
            'min' => self::SHOPPING_BASE_FEE,
            'max' => self::SHOPPING_MAX_FEE,
        ];

        return $this->shoppingFee;
    }

    /**
     * Calculate effective per-km rate for delivery
     */
    private function calculateEffectiveRate(): float
    {
        if ($this->distanceKm <= self::SHORT_DISTANCE_MAX) {
            return self::PER_KM_RATE_SHORT;
        }
        if ($this->distanceKm >= self::LONG_DISTANCE_START) {
            return self::PER_KM_RATE_LONG;
        }

        return self::PER_KM_RATE_STANDARD;
    }

    /**
     * Calculate fuel surcharge
     */
    private function calculateFuelSurcharge(): float
    {
        if ($this->currentFuelPrice <= self::FUEL_BASE_PRICE) {
            return 0;
        }

        $priceDiffPercent = ($this->currentFuelPrice - self::FUEL_BASE_PRICE) / self::FUEL_BASE_PRICE;
        $surchargePercent = min($priceDiffPercent, self::FUEL_SURCHARGE_PERCENT);

        $baseDistanceCost = $this->distanceKm * $this->effectivePerKmRate;
        $surcharge = $baseDistanceCost * $surchargePercent;

        $this->fuelSurcharge = round($surcharge, 0);
        $this->breakdown['fuel_surcharge'] = $this->fuelSurcharge;

        return $this->fuelSurcharge;
    }

    /**
     * Calculate premium fee for long distance
     */
    private function calculatePremiumFee(): float
    {
        if ($this->distanceKm <= self::SHORT_DISTANCE_MAX) {
            return 0;
        }

        $premiumKm = $this->distanceKm - self::SHORT_DISTANCE_MAX;
        $fee = $premiumKm * self::PREMIUM_RATE_PER_KM_EXTRA;

        $this->premiumFee = round($fee, 0);
        $this->breakdown['premium_distance'] = $this->premiumFee;

        return $this->premiumFee;
    }

    /**
     * Calculate waiting fee at market
     */
    private function calculateWaitingFee(): float
    {
        if ($this->waitingMinutes <= self::WAITING_FREE_MINUTES) {
            return 0;
        }

        $paidMinutes = $this->waitingMinutes - self::WAITING_FREE_MINUTES;
        $fee = $paidMinutes * self::WAITING_RATE_PER_MINUTE;

        $this->waitingFee = $fee;
        $this->breakdown['waiting_fee'] = $this->waitingFee;

        return $this->waitingFee;
    }

    /**
     * Calculate remote zone extra
     */
    private function calculateRemoteExtra(): float
    {
        if (! $this->isRemoteZone) {
            return 0;
        }

        $baseDeliveryCost = $this->deliveryFee;
        $extra = $baseDeliveryCost * (self::REMOTE_ZONE_EXTRA_PERCENT / 100);

        $this->remoteExtra = round($extra, 0);
        $this->breakdown['remote_extra'] = $this->remoteExtra;

        return $this->remoteExtra;
    }

    /**
     * Calculate building access fee (no elevator)
     */
    private function calculateBuildingFee(): float
    {
        if ($this->hasElevator || $this->floorNumber <= self::NO_ELEVATOR_START_FLOOR) {
            return 0;
        }

        $floorsAbove = $this->floorNumber - self::NO_ELEVATOR_START_FLOOR;
        $fee = $floorsAbove * self::NO_ELEVATOR_FEE;

        $this->buildingFee = $fee;
        $this->breakdown['building_fee'] = $this->buildingFee;

        return $this->buildingFee;
    }

    /**
     * Apply night/rain multipliers to delivery fee only
     */
    private function applyMultipliers(): float
    {
        $multiplier = 1.0;
        $additional = 0;

        $baseDeliveryFee = $this->deliveryFee + $this->fuelSurcharge + $this->premiumFee + $this->remoteExtra;

        if ($this->isNightTime) {
            $nightFee = $baseDeliveryFee * 0.25;
            $additional += $nightFee;
            $this->breakdown['night_delivery'] = round($nightFee, 0);
        }

        if ($this->isRaining) {
            $rainFee = $baseDeliveryFee * 0.15;
            $additional += $rainFee;
            $this->breakdown['rain_delivery'] = round($rainFee, 0);
        }

        $this->multiplierFee = round($additional, 0);

        return $this->multiplierFee;
    }

    /**
     * Calculate platform margin (platform profit)
     */
    private function calculatePlatformMargin(float $total): float
    {
        $margin = $total * (self::PLATFORM_MARGIN_PERCENT / 100);
        $margin = max(self::MARGIN_MIN, min(self::MARGIN_MAX, $margin));

        return round($margin, 0);
    }

    /**
     * Main calculation method
     */
    public function calculate(): array
    {
        // 1. Calculate SHOPPING FEE (rider gets this for picking items)
        $this->calculateShoppingFee();

        // 2. Calculate DELIVERY DISTANCE FEE
        $this->effectivePerKmRate = $this->calculateEffectiveRate();
        $this->deliveryFee = $this->distanceKm * $this->effectivePerKmRate;
        $this->breakdown['delivery_fee'] = round($this->deliveryFee, 0);
        $this->breakdown['rate_per_km'] = $this->effectivePerKmRate;
        $this->breakdown['rate_type'] = $this->getRateType();

        // 3. Add base delivery fee
        $this->deliveryFee += self::BASE_DELIVERY_FEE;

        // 4. Calculate add-ons to delivery
        $this->calculateFuelSurcharge();
        $this->calculatePremiumFee();
        $this->calculateWaitingFee();
        $this->calculateRemoteExtra();
        $this->calculateBuildingFee();
        $this->applyMultipliers();

        // 5. Total RIDER PAYOUT = Shopping Fee + Delivery Fee + all add-ons + waiting + building
        $this->totalRiderPayout = $this->shoppingFee
            + $this->deliveryFee
            + $this->fuelSurcharge
            + $this->premiumFee
            + $this->waitingFee
            + $this->remoteExtra
            + $this->buildingFee
            + $this->multiplierFee;

        $this->breakdown['rider_payout'] = round($this->totalRiderPayout, 0);

        // 6. Calculate PLATFORM MARGIN (platform profit)
        $this->platformMargin = $this->calculatePlatformMargin($this->totalRiderPayout);
        $this->breakdown['platform_margin'] = $this->platformMargin;

        // 7. Customer total = Rider payout + Platform margin
        $this->customerTotal = $this->totalRiderPayout + $this->platformMargin;

        $this->breakdown['customer_total'] = round($this->customerTotal, 0);

        return $this->getResult();
    }

    private function getRateType(): string
    {
        if ($this->distanceKm <= self::SHORT_DISTANCE_MAX) {
            return 'short';
        }
        if ($this->distanceKm >= self::LONG_DISTANCE_START) {
            return 'long';
        }

        return 'standard';
    }

    public function shouldNotifyCustomer(): bool
    {
        return $this->distanceKm > self::PREMIUM_NOTIFY_KM;
    }

    // ============ SETTERS ============

    public function setDistance(float $km): self
    {
        $this->distanceKm = max(0, $km);

        return $this;
    }

    public function setItemCount(int $count): self
    {
        $this->itemCount = $count;

        return $this;
    }

    public function setBulkyItemCount(int $count): self
    {
        $this->bulkyItemCount = $count;

        return $this;
    }

    public function setWaitingMinutes(int $minutes): self
    {
        $this->waitingMinutes = $minutes;

        return $this;
    }

    public function setRemoteZone(bool $isRemote): self
    {
        $this->isRemoteZone = $this->distanceKm >= self::REMOTE_THRESHOLD_KM;

        return $this;
    }

    public function setFloorNumber(int $floor, bool $hasElevator = true): self
    {
        $this->floorNumber = $floor;
        $this->hasElevator = $hasElevator;

        return $this;
    }

    public function setNightTime(bool $isNight): self
    {
        $this->isNightTime = $isNight;

        return $this;
    }

    public function setRaining(bool $isRaining): self
    {
        $this->isRaining = $isRaining;

        return $this;
    }

    public function setCurrentFuelPrice(float $price): self
    {
        $this->currentFuelPrice = $price;

        return $this;
    }

    public function getResult(): array
    {
        return [
            'customer_pays' => $this->customerTotal,
            'rider_gets' => [
                'shopping_fee' => $this->shoppingFee,
                'delivery_fee' => round($this->deliveryFee, 0),
                'waiting_fee' => $this->waitingFee,
                'premium_fee' => $this->premiumFee,
                'fuel_surcharge' => $this->fuelSurcharge,
                'remote_extra' => $this->remoteExtra,
                'building_fee' => $this->buildingFee,
                'weather_extra' => $this->multiplierFee,
                'total_rider_payout' => round($this->totalRiderPayout, 0),
            ],
            'platform_gets' => $this->platformMargin,
            'breakdown' => $this->breakdown,
        ];
    }

    public function getFormattedBreakdown(): array
    {
        return [
            'shopping_fee' => [
                'component' => 'Shopping Fee (Rider picks items)',
                'amount' => $this->shoppingFee,
                'details' => "Base {$this->shoppingFee} KSH",
            ],
            'delivery_fee' => [
                'component' => 'Delivery Fee',
                'amount' => round($this->deliveryFee, 0),
                'details' => $this->distanceKm . ' km × ' . $this->effectivePerKmRate . ' KSH + base 80',
            ],
            'extras' => [
                'component' => 'Extras',
                'amount' => $this->waitingFee + $this->premiumFee + $this->fuelSurcharge + $this->remoteExtra + $this->buildingFee + $this->multiplierFee,
            ],
            'rider_total' => [
                'component' => 'TOTAL RIDER PAYOUT',
                'amount' => round($this->totalRiderPayout, 0),
            ],
            'platform' => [
                'component' => 'Platform Margin',
                'amount' => $this->platformMargin,
            ],
            'customer_total' => [
                'component' => 'CUSTOMER PAYS',
                'amount' => $this->customerTotal,
            ],
        ];
    }
}
