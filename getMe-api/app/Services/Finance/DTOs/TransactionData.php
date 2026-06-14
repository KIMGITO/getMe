<?php
// app/Services/Finance/DTOs/TransactionData.php

namespace App\Services\Finance\DTOs;

use App\Enums\Gateways;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Services\Finance\MpesaService;

class TransactionData
{
    public function __construct(
        public readonly string $userId,
        public readonly TransactionType $type,
        public readonly TransactionStatus $status,
        public readonly Gateways $gateway,
        public readonly float $amount,
        public readonly float $fee,
        public readonly string $referenceId,
        public readonly array $metadata,
        public readonly ?string $description = null
    ) {}

    public static function fromMpesaCallback(string $userId, array $callbackData, string $transactionType): self
    {
        $metadata = $callbackData['CallbackMetadata']['Item'] ?? [];
        $amount = $metadata[0]['Value'] ?? 0;
        $referenceId = $metadata[1]['Value'] ?? null;
        
        // Calculate fee using MpesaService (inject later)
        $fee = app(MpesaService::class)->getMpesaBusinessCharge($amount, $transactionType);
        
        return new self(
            userId: $userId,
            type: TransactionType::DEPOSIT,
            status: TransactionStatus::COMPLETED,
            gateway: Gateways::MPESA,
            amount: $amount,
            fee: $fee,
            referenceId: $referenceId,
            metadata: $callbackData,
            description: "M-Pesa payment of {$amount} from user {$userId}"
        );
    }
    
    public function getNetAmount(): float
    {
        return $this->amount - $this->fee;
    }
}