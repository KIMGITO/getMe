import { walletServices } from '@/services/walletServices';
import { useToastStore } from '@/stores/useToastStore';
import { useState } from 'react';

interface UseWalletMutationProps {
  availableBalance: number;
  onSuccessClose: () => void;
}

export function useWalletMutation({
  availableBalance,
  onSuccessClose,
}: UseWalletMutationProps) {
  const [phone, setPhone] = useState('254');
  const [amount, setAmount] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setPhone('254');
    setAmount('');
    setValidationError(null);
    setSuccess(false);
    setLoading(false);
  };

  const executeTransaction = (type: 'topup' | 'withdraw') => {
    setValidationError(null);

    const phoneRegex = /^(?:254[1-9]\d{8}|0[17]\d{8})$/;
    if (!phoneRegex.test(phone)) {
      setValidationError(
        'Provide a valid Kenyan safaricom registered number format start with 254 , 07 or 01',
      );
      return;
    }

    const numericAmount = parseFloat(amount);

    if (type === 'topup') {
      if (isNaN(numericAmount) || numericAmount < 1 || numericAmount > 150000) {
        setValidationError(
          'Topup value metrics must span inside Ksh 1 to Ksh 150,000 layers.',
        );
        return;
      }
    } else if (type === 'withdraw') {
      if (isNaN(numericAmount) || numericAmount < 1 || numericAmount > 50000) {
        setValidationError(
          'M-Pesa channel payout limits require values between Ksh 1 and Ksh 50,000.',
        );
        return;
      }
      if (numericAmount > availableBalance) {
        setValidationError(
          'Insufficient spendable balance. Locked escrow funds cannot be withdrawn.',
        );
        return;
      }
    }

    try {
      setLoading(true);
      return type === 'topup'
        ? walletServices
            .topup(numericAmount, phone)
            .then((res) => {
              setLoading(false);
              if (res.success === false) {
                setValidationError(res.message);
              } else {
                onSuccessClose();
                resetForm();
                setSuccess(true);
              }

              return res;
            })
            .finally(() => {
              setLoading(false);
            })
        : walletServices
            .withdraw(numericAmount, phone)
            .then((res) => {
              setLoading(false);
              if (res.success === false) {
                setValidationError(res.message);
              } else {
                onSuccessClose();
                resetForm();
                setSuccess(true);
              }

              return res;
            })
            .finally(() => {
              setLoading(false);
            });
    } catch (err: any) {
      setLoading(false);
      setValidationError(err.message);
      return err;
    }
  };

  return {
    phone,
    setPhone,
    amount,
    setAmount,
    validationError,
    loading,
    success,
    executeTransaction,
    setValidationError,
    resetForm,
  };
}
