import React, { useEffect } from 'react';
import { BiLoaderAlt } from 'react-icons/bi';
import { useOrderStore } from '@/stores/useOrderStore';

export default function OrderFindingRiderStep() {
  const store = useOrderStore();

  useEffect(() => {
    // Optional: Add logic here to trigger a WebSocket 
    // or start polling the API for rider status
    console.log("Search process initiated for list:", store.shoppingListId);
  }, [store.shoppingListId]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-6">
      <div className="relative">
        <BiLoaderAlt className="text-6xl text-primary animate-spin" />
        {/* Decorative glow effect */}
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-black">Finding Nearby Riders</h2>
        <p className="text-on-surface-variant">
          We are currently broadcasting your request to riders in your vicinity.
          Please stay on this screen while we match you.
        </p>
      </div>

      <button 
        onClick={() => store.setStep('cart')}
        className="mt-8 text-sm text-error font-medium hover:underline"
      >
        Cancel Search
      </button>
    </div>
  );
}