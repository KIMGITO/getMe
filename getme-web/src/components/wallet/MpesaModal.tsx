import React, { useEffect } from 'react';
import { BiX, BiCheckCircle, BiCoin } from 'react-icons/bi';
import Input from '@/components/UI/Input';
import SubmitButton from '@/components/UI/submit-btn';
import mpes_logo from '@assets/branding/mpesa-logo.png';
import { useWalletMutation } from '@/hooks/useWalletMutation';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/useToastStore';

interface MpesaModalProps {
  mode: 'topup' | 'withdraw';
  availableBalance: number;
  onClose: () => void;
}

export const MpesaModal: React.FC<MpesaModalProps> = ({
  mode,
  availableBalance,
  onClose,
}) => {
  const {
    phone,
    setPhone,
    amount,
    setAmount,
    validationError,
    loading,
    success,
    setValidationError,
    executeTransaction,
  } = useWalletMutation({ availableBalance, onSuccessClose: onClose });
    const  toast = useToastStore((state) => state.toast);


    const {user} = useAuthStore();
    useEffect(() => {
      if (user?.phone) {
        setPhone(user?.phone);
      }
    },[])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const  res = await  executeTransaction(mode);

    console.log('res', res);
    toast({
      message: res.success == true? 'Success' : 'Error',
      variant: res.success == true? 'success' : 'error',
      description: res.message ,
      duration: 5000,
      position: 'top-center',
    })

  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest border border-outline-variant w-full max-w-md rounded-3xl p-6 shadow-xl relative space-y-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-outline-variant pb-3">
          <div className="flex items-center gap-3">
            <img src={mpes_logo} className="h-7 object-contain" alt="M-Pesa" />
            <span className="text-xs text-on-surface-variant font-bold border-l border-outline-variant pl-3">
              {mode === 'topup' ? 'STK Push System' : 'B2C Pay Outport'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-surface-variant rounded-xl text-on-surface-variant transition-colors"
          >
            <BiX className="text-2xl" />
          </button>
        </div>

        {success ? (
          /* Success Screen */
          <div className="py-8 text-center space-y-3 flex flex-col items-center">
            <BiCheckCircle className="text-6xl text-green-500 animate-bounce" />
            <h4 className="text-lg font-bold text-on-surface">
              {mode === 'topup'
                ? 'Prompt Transmitted'
                : 'Disbursement Dispatched'}
            </h4>
            <p className="text-xs text-on-surface-variant max-w-xs mx-auto text-center">
              {mode === 'topup'
                ? 'Check your handset screen context layer for the authorization pin validation grid.'
                : 'The requested liquidation payload has issued. You will receive an SMS confirmation shortly.'}
            </p>
          </div>
        ) : (
          /* Core Interconnect Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {validationError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-200">
                {validationError}
              </div>
            )}

            <Input
              label={
                mode === 'topup'
                  ? 'Safaricom Registered Phone Number *'
                  : 'Destination Mobile Wallet Number *'
              }
              placeholder="254712345678"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.trim());
                setValidationError(null);
              }}
              disabled={loading}
            />

            <Input
              label={
                mode === 'topup'
                  ? 'Topup Loading Amount (Ksh) *'
                  : 'Withdrawal Liquidate Volume (Ksh) *'
              }
              type="number"
              placeholder={
                mode === 'topup'
                  ? 'Min: 1, Max: 150,000'
                  : `Max Spendable: Ksh ${availableBalance}`
              }
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setValidationError(null);
              }}
              disabled={loading}
            />

            <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant flex items-start gap-2.5">
              <BiCoin className="text-lg text-primary mt-0.5" />
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                {mode === 'topup'
                  ? 'Submitting will broadcast an instant, secure Safaricom cryptographic STK menu window directly onto your active SIM line to prompt manual PIN insertion safely.'
                  : 'Submitting executes an asynchronous institutional bank settlement routing directly to the specified destination Safaricom ledger node immediately.'}
              </p>
            </div>

            <SubmitButton
              className="bg-green-600 hover:bg-green-700 text-white w-full"
              label={
                loading
                  ? 'Processing Interconnect Link...'
                  : mode === 'topup'
                    ? 'Initiate M-Pesa Topup'
                    : 'Confirm Cash Outbound'
              }
              disabled={loading || !amount || !phone}
            />
          </form>
        )}
      </div>
    </div>
  );
};
