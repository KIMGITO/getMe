<?php
// app/Services/Finance/Accounting/DoubleEntryValidator.php

namespace App\Services\Finance\Accounting;

class DoubleEntryValidator
{
    public function validate(array $journalLines): bool
    {
        $totalDebit = array_sum(array_column($journalLines, 'debit'));
        $totalCredit = array_sum(array_column($journalLines, 'credit'));
        
        if (abs($totalDebit - $totalCredit) > 0.01) { 
            throw new \Exception(
                "Journal entry doesn't balance! Debits: {$totalDebit}, Credits: {$totalCredit}"
            );
        }
        
        // Verify each line has either debit or credit, not both
        foreach ($journalLines as $line) {
            if ($line['debit'] > 0 && $line['credit'] > 0) {
                throw new \Exception("Line cannot have both debit and credit");
            }
            if ($line['debit'] == 0 && $line['credit'] == 0) {
                throw new \Exception("Line must have either debit or credit");
            }
        }
        
        return true;
    }
}