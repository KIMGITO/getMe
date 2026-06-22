import React, { useState } from 'react';
import { BiErrorCircle, BiWallet } from 'react-icons/bi';
import { useOrderStore } from '@/stores/useOrderStore';
import { shoppingService } from '@/services/shoppingService';
import Input from '@/components/UI/Input';
import SubmitButton from '@/components/UI/submit-btn';

export default function OrderSummaryStep() {
  const store = useOrderStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFinalCheckout = async () => {
    setIsProcessing(true);
    try {
      const payload = {
        market_location: store.market_location,
        delivery_address_id: store.addressMode === 'saved' ? store.delivery_address_id : null,
        ...(store.addressMode === 'custom' && { delivery_location: store.custom_delivery_location }),
        tip_amount: store.tip_amount || 0,
      };
      const result = await shoppingService.checkout(store.shoppingListId ?? '', payload);
      if (result.success) {
        store.clearStore();
        store.setStep('finding_rider');
      }
    } catch (error) {
      alert('Checkout Failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {!store.feePreview?.wallet_sufficient && (
        <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-center justify-between">
           <div className="text-red-800">
              <h4 className="font-bold">Insufficient Wallet Balance</h4>
              <p className="text-xs">Top up KSH {store.feePreview?.suggested_topup_amount}</p>
           </div>
           <button className="bg-red-600 text-white py-2.5 px-5 rounded-xl"><BiWallet /></button>
        </div>
      )}

      <div className="bg-surface p-6 rounded-2xl border space-y-4">
        <h2 className="font-black uppercase">Order Summary</h2>
        <div className="flex justify-between p-4 bg-surface-container-low rounded-xl">
           <span className="font-bold">Goods Subtotal</span>
           <span className="font-mono">Ksh {store.feePreview?.items_estimated_cost}</span>
        </div>
        
        <Input label="Add Rider Tip (Optional)" type="number" value={store.tip_amount || ''} onChange={(e) => store.updateLogistics({ tip_amount: parseFloat(e.target.value) || 0 })} />
        
        <div className="flex justify-between p-4 bg-primary text-white rounded-xl font-black">
           <span>Grand Total</span>
           <span>Ksh {store.feePreview?.total_order_cost?  store.feePreview?.total_order_cost + (store.tip_amount || 0) : 0}</span>
        </div>
      </div>

      <SubmitButton label={isProcessing ? 'Dispatching...' : 'Confirm & Dispatch'} disabled={isProcessing || !store.feePreview?.wallet_sufficient} onClick={handleFinalCheckout} />
    </div>
  );
}