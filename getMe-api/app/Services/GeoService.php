<?php

namespace App\Services;

use App\Enums\RiderActivityStatus;
use Illuminate\Support\Facades\Redis;
use InvalidArgumentException;

class GeoService
{
    private string $activeRidersKey = 'active:riders';

    private string $geoTrackingKey = 'getme:geo_track';

    private string $riderSessionPrefix = 'rider:session:';

    private string $statusKey = 'rider:status:';

    private int $onlineTimeout = 60;

    /**
     * Update the rider's location in the Redis geo index.
     *
     * @param  string  $riderId  The unique identifier for the rider (e.g., "rider_55").
     * @param  float  $lat  The latitude of the rider's current location.
     * @param  float  $lng  The longitude of the rider's current location.
     * @param  bool  $keepAlive  Whether to extend the rider's online session.
     */
    public function updateLocation(string $riderId, float $lat, float $lng, bool $keepAlive = true): void
    {
        // Validate coordinates
        $this->validateCoordinates($lat, $lng);

        // Add to geo index
        Redis::geoadd(
            $this->activeRidersKey,
            $lng,
            $lat,
            $riderId
        );

        // Keep rider alive for realtime filtering
        if ($keepAlive) {
            Redis::setex($this->riderSessionPrefix.$riderId, $this->onlineTimeout, time());
        }
    }

    /**
     * Rider state management
     */
    public function setStatus(string $riderId, RiderActivityStatus $status)
    {
            $allowedStatuses = [
                RiderActivityStatus::STATUS_IDLE,
                RiderActivityStatus::STATUS_BUSY,
                RiderActivityStatus::STATUS_OFFLINE,
                RiderActivityStatus::STATUS_SELECTED,
                RiderActivityStatus::STATUS_ON_DELIVERY,
                RiderActivityStatus::STATUS_BREAK,
                RiderActivityStatus::STATUS_BATTERY_LOW,
            ];

        if (! in_array($status, $allowedStatuses)) {
            throw new InvalidArgumentException("Invalid status '{$status}'. Allowed statuses: ".implode(', ', $allowedStatuses));
        }

        $statusData = [
            'status' => $status,
            'updated_at' => time(),
        ];

        Redis::set($this->statusKey.$riderId, json_encode($statusData));
        Redis::expire($this->statusKey.$riderId, 43200);

        return true;
    }

    public function getStatus(string $riderId)
    {
        $statusData = Redis::get($this->statusKey.$riderId);

        if (empty($statusData)) {
            return null;
        }

        $status = json_decode($statusData, true);
        $updatedAt = $status['updated_at'] ?? 0;
        if (time() - $updatedAt > 43200) {
            return RiderActivityStatus::STATUS_OFFLINE;
        }
        return $status['status'] ?? RiderActivityStatus::STATUS_OFFLINE;
    }

    /**
     * Get a rider's current location.
     *
     * @return array|null Returns ['lat' => float, 'lng' => float] or null if not found
     */
    public function getRiderLocation(string $riderId): ?array
    {
        $positions = Redis::geopos($this->activeRidersKey, $riderId);

        if (! $positions || ! isset($positions[0]) || $positions[0][0] === null) {
            return null;
        }

        return [
            'lng' => (float) $positions[0][0],
            'lat' => (float) $positions[0][1],
        ];
    }

    /**
     * Check if a rider is currently active/online.
     */
    public function isRiderActive(string $riderId): bool
    {
        return Redis::exists($this->riderSessionPrefix.$riderId) === 1;
    }

    /**
     * Check if a member exists in a specified sorted set key.
     *
     * @param  string  $key  The Redis sorted set key to check.
     * @param  string  $member  The member to check for existence.
     * @return bool Returns true if the member exists, false otherwise.
     *
     * @throws InvalidArgumentException if the key is not allowed.
     */
    public function exists(string $key, string $member): bool
    {
        $this->validateAllowedKey($key, ['exists']);

        $score = Redis::zScore($key, $member);

        return $score !== false;
    }

    /**
     * Add a rider and client location to the geo index for distance calculations.
     *
     * @param  array  $rider  Associative array with 'id', 'lat', and 'lng' keys.
     * @param  array  $client  Associative array with 'id', 'lat', and 'lng' keys.
     *
     * @throws InvalidArgumentException
     */
    public function addDeliveryLocations(array $rider, array $market, array $client): void
    {
        $this->validateLocationArray($rider, 'rider');
        $this->validateLocationArray($client, 'client');

        Redis::geoadd(
            $this->geoTrackingKey,
            $rider['lng'],
            $rider['lat'],
            "rider:{$rider['id']}"
        );

        Redis::geoadd(
            $this->geoTrackingKey,
            $client['lng'],
            $client['lat'],
            "client:{$client['id']}"
        );
    }

    /**
     * Find nearby active riders within a specified radius.
     *
     * @param  float  $lat  Latitude of the center point
     * @param  float  $lng  Longitude of the center point
     * @param  int  $radius  Search radius in kilometers
     * @param  bool  $onlyActive  Whether to filter only online riders
     * @return array List of nearby riders with their distances and coordinates
     */
    public function findNearbyRiders(float $lat, float $lng, int $radius, bool $onlyActive = true): array
    {
        $this->validateCoordinates($lat, $lng);

        $riders = Redis::georadius(
            $this->activeRidersKey,
            $lng,
            $lat,
            $radius,
            'km',
            ['WITHDIST', 'WITHCOORD']
        );

        if (! $onlyActive) {
            return $riders;
        }

        // Filter only active riders
        $activeRiders = [];
        foreach ($riders as $rider) {
            $riderId = $rider[0];
            if ($this->isRiderActive($riderId)) {
                $activeRiders[] = $rider;
            }
        }

        return $activeRiders;
    }

    /**
     * Find nearby riders with additional filtering options.
     *
     * @param  int|null  $limit  Maximum number of riders to return
     * @param  array|null  $excludeRiderIds  Array of rider IDs to exclude
     */
    public function findNearbyRidersFiltered(
        float $lat,
        float $lng,
        int $radius,
        ?int $limit = null,
        ?array $excludeRiderIds = null
    ): array {
        $riders = $this->findNearbyRiders($lat, $lng, $radius, true);

        // Apply exclusions
        if ($excludeRiderIds) {
            $riders = array_filter($riders, function ($rider) use ($excludeRiderIds) {
                return ! in_array($rider[0], $excludeRiderIds);
            });
        }

        // Apply limit
        if ($limit !== null && $limit > 0) {
            $riders = array_slice($riders, 0, $limit);
        }

        return array_values($riders);
    }

    /**
     * Remove a rider from active tracking.
     */
    public function removeRider(string $riderId): void
    {
        $this->remove($this->activeRidersKey, $riderId);
        Redis::del($this->riderSessionPrefix.$riderId);
    }

    /**
     * Remove a member from a specified sorted set key.
     *
     * @param  string  $key  The Redis sorted set key from which to remove the member.
     * @param  string  $member  The member to remove.
     *
     * @throws InvalidArgumentException if the key is not allowed.
     */
    public function remove(string $key, string $member): void
    {
        $this->validateAllowedKey($key, ['removal']);
        Redis::zRem($key, $member);
    }

    /**
     * Remove multiple members from a sorted set key.
     * 
     * @param  string  $key  The Redis sorted set key from which to remove the members.
     * @param  array  $members  An array of members to remove.
     *  
     * @throws InvalidArgumentException if the key is not allowed.
     */
    public function removeMultiple(string $key, array $members): void
    {
        $this->validateAllowedKey($key, ['removal']);
        Redis::zRem($key, $members);
    }

    /**
     * Add a point to the geo tracking key for distance calculations.
     *
     * @return int Number of elements added to the sorted set
     */
    public function addPointForDistanceCalculation(float $lat, float $lng, string $member): int
    {
        $this->validateCoordinates($lat, $lng);

        return Redis::geoadd($this->geoTrackingKey, $lng, $lat, $member);
    }

    /**
     * Add multiple points at once for distance calculations.
     *
     * @param  array  $points  Array of points with 'lat', 'lng', 'member' keys
     * @return int Number of elements added
     */
  public function addMultiplePoints(array $points): int
{
    $args = [];

    foreach ($points as $index => $point) {

        if (!isset($point['lat'], $point['lng'])) {
            throw new \InvalidArgumentException(
                "Point at index {$index} must contain lat and lng."
            );
        }

        $this->validateCoordinates($point['lat'], $point['lng']);

        $member = $point['member'] ?? uniqid('member_', true);

        $args[] = $point['lng'];
        $args[] = $point['lat'];
        $args[] = $member;
    }

    return Redis::geoadd($this->geoTrackingKey, ...$args);
}

    /**
     * Calculate the distance between any two members in the geo index.
     *
     * @param  string  $memberA  Example: "market_102", "rider:55", "client:12"
     * @param  string  $memberB  Example: "rider:55", "client:12"
     * @param  string  $unit  Unit of measurement ('km', 'm', 'mi', 'ft')
     * @return float|null Returns distance, or null if a member doesn't exist
     */
    public function calculateDistance(string $memberA, string $memberB, string $unit = 'km'): ?float
    {
        $this->validateUnit($unit);

        $distance = Redis::geodist(
            $this->geoTrackingKey,
            $memberA,
            $memberB,
            $unit
        );

        return $distance !== false && $distance !== null ? (float) $distance : null;
    }

    /**
     * Get all points within a radius of a given member.
     *
     * @param  string  $member  The center point member
     * @param  int  $radius  Radius in kilometers
     * @param  string  $unit  Unit of measurement
     */
    public function getPointsNearMember(string $member, int $radius, string $unit = 'km'): array
    {
        $this->validateUnit($unit);

        return Redis::georadiusbymember(
            $this->geoTrackingKey,
            $member,
            $radius,
            $unit,
            ['WITHDIST', 'WITHCOORD']
        );
    }

    /**
     * Get the geohash for a member.
     */
    public function getGeohash(string $key, string $member): ?string
    {
        $this->validateAllowedKey($key, ['geohash']);

        $geohashes = Redis::geohash($key, $member);

        return isset($geohashes[0]) ? $geohashes[0] : null;
    }

    /**
     * Clean up inactive riders (should be run via scheduled job).
     *
     * @return int Number of riders cleaned up
     */
    public function cleanupInactiveRiders(): int
    {
        $allRiders = Redis::zRange($this->activeRidersKey, 0, -1);
        $cleanedCount = 0;

        foreach ($allRiders as $riderId) {
            if (! $this->isRiderActive($riderId)) {
                $this->removeRider($riderId);
                $cleanedCount++;
            }
        }

        return $cleanedCount;
    }

    /**
     * Get statistics about active riders.
     */
    public function getStats(): array
    {
        $activeCount = Redis::zCard($this->activeRidersKey);
        $onlineCount = 0;

        $allRiders = Redis::zRange($this->activeRidersKey, 0, -1);
        foreach ($allRiders as $riderId) {
            if ($this->isRiderActive($riderId)) {
                $onlineCount++;
            }
        }

        return [
            'total_active_in_geo' => $activeCount,
            'currently_online' => $onlineCount,
            'tracking_key' => $this->geoTrackingKey,
            'points_in_tracking' => Redis::zCard($this->geoTrackingKey),
        ];
    }

    /**
     * Clear all data (useful for testing).
     *
     * @param  bool  $confirm  Confirmation flag to prevent accidental deletion
     *
     * @throws InvalidArgumentException
     */
    public function clearAllData(bool $confirm = false): void
    {
        if (! $confirm) {
            throw new InvalidArgumentException('Confirm with true to clear all rider data');
        }

        Redis::del($this->activeRidersKey);
        Redis::del($this->geoTrackingKey);

        // Clear all rider sessions
        $keys = Redis::keys($this->riderSessionPrefix.'*');
        if (! empty($keys)) {
            Redis::del(...$keys);
        }
    }

    /**
     * Validate coordinates.
     *
     * @throws InvalidArgumentException
     */
    private function validateCoordinates(float $lat, float $lng): void
    {
        if ($lat < -90 || $lat > 90) {
            throw new InvalidArgumentException("Invalid latitude: {$lat}. Must be between -90 and 90.");
        }

        if ($lng < -180 || $lng > 180) {
            throw new InvalidArgumentException("Invalid longitude: {$lng}. Must be between -180 and 180.");
        }
    }

    /**
     * Validate location array structure.
     *
     * @throws InvalidArgumentException
     */
    private function validateLocationArray(array $location, string $type): void
    {
        if (! isset($location['id'], $location['lat'], $location['lng'])) {
            throw new InvalidArgumentException("{$type} location must contain 'id', 'lat', and 'lng' keys");
        }

        $this->validateCoordinates($location['lat'], $location['lng']);
    }

    /**
     * Validate allowed keys for sensitive operations.
     *
     * @throws InvalidArgumentException
     */
    private function validateAllowedKey(string $key, array $allowedOperations): void
    {
        $allowedKeys = [
            $this->activeRidersKey,
            $this->geoTrackingKey,
        ];

        $isAllowed = false;
        foreach ($allowedKeys as $allowed) {
            if (str_starts_with($key, $allowed)) {
                $isAllowed = true;
                break;
            }
        }

        if (! $isAllowed) {
            throw new InvalidArgumentException(
                "Key '{$key}' is not allowed for operation: ".implode(', ', $allowedOperations)
            );
        }
    }

    /**
     * Validate unit of measurement.
     *
     * @throws InvalidArgumentException
     */
    private function validateUnit(string $unit): void
    {
        $allowedUnits = ['m', 'km', 'mi', 'ft'];

        if (! in_array($unit, $allowedUnits)) {
            throw new InvalidArgumentException(
                "Invalid unit '{$unit}'. Allowed units: ".implode(', ', $allowedUnits)
            );
        }
    }
}
