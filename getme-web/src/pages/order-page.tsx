import React from 'react';
import { BiChevronLeft, BiEraser } from 'react-icons/bi';
import { useOrderStore } from '@/stores/useOrderStore';
import OrderCartStep from './order/order-cart-steps';
import OrderRouteStep from './order/order-route-steps';
import OrderSummaryStep from './order/order-summary-step';
import OrderFindingRiderStep from './order/order-finding-rider-step';
import OrderHistoryStep from './order/order-history-step';

export default function IntegratedOrderPage() {
  const store = useOrderStore();

  return (
    <div className="flex flex-col h-[100dvh] max-w-4xl w-full mx-auto bg-surface-container-lowest text-on-surface my-4 rounded-2xl overflow-hidden font-sans antialiased border border-outline-variant">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low z-10">
        <div className="flex items-center gap-3">
          {store.step !== 'history' && (
            <button
              onClick={() => {
                if (store.step === 'cart') store.setStep('history');
                if (store.step === 'route') store.setStep('cart');
                if (store.step === 'summary') store.setStep('route');
              }}
              className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors"
            >
              <BiChevronLeft className="text-2xl" />
            </button>
          )}
          <h2 className="text-lg font-black tracking-tight">
            {store.step === 'history' && '1. Order History'}
            {store.step === 'cart' && '2. Order Items & Details'}
            {store.step === 'route' && '3. Pickup & Delivery Maps'}
            {store.step === 'summary' && '4. Finance & Checkout'}
            {store.step === 'finding_rider' && '5. Finding nearby riders '}

          </h2>
        </div>
        <button
          onClick={() => store.clearStore()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-error hover:bg-error/10 rounded-xl transition-all"
        >
          <BiEraser /> Reset
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {store.step === 'history' && <OrderHistoryStep />}
        {store.step === 'cart' && <OrderCartStep />}
        {store.step === 'route' && <OrderRouteStep />}
        {store.step === 'summary' && <OrderSummaryStep />}
        {store.step === 'finding_rider' && <OrderFindingRiderStep />}
      </div>
    </div>
  );
}