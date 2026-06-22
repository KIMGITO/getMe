import React, { useState } from 'react';
import { BiMap, BiCheckCircle } from 'react-icons/bi';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useOrderStore } from '@/stores/useOrderStore';
import { shoppingService } from '@/services/shoppingService';
import Input from '@/components/UI/Input';
import SubmitButton from '@/components/UI/submit-btn';
import MapClickHandler from '@/handlers/map-click';

const DUMMY_SAVED_ADDRESSES = [
  { id: 'ulid_addr_1', name: 'Home Layout Address', details: 'South C, Block 4' },
  { id: 'ulid_addr_2', name: 'CODENSONS HQ Office', details: 'Mombasa Road, Hangar B' },
];

export default function OrderRouteStep() {
  const store = useOrderStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handlePreviewFee = async () => {
    if (!store.shoppingListId) return;
    setIsProcessing(true);
    try {
      const payload = {
        market_location: store.market_location,
        delivery_address_id: store.addressMode === 'saved' ? store.delivery_address_id : null,
        ...(store.addressMode === 'custom' && { delivery_location: store.custom_delivery_location }),
      };
      const result = await shoppingService.previewFee(store.shoppingListId, payload);
      store.setFeePreview(result);
      store.setStep('summary');
    } catch (error) {
      setFieldErrors(shoppingService.parseValidationErrors(error));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Map Implementation */}
      <section className="space-y-4">
        <h3 className="font-bold text-sm uppercase text-on-surface-variant flex items-center gap-2">
          <BiMap className="text-primary" /> Pickup Location
        </h3>
        <div className="h-48 rounded-2xl overflow-hidden border">
           <MapContainer center={[store.market_location.lat, store.market_location.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapClickHandler onClick={(lat, lng) => store.updateMarketLocation(lat, lng)} />
              <Marker position={[store.market_location.lat, store.market_location.lng]} />
           </MapContainer>
        </div>
      </section>
      
      {/* Address Mode Selection & Logic */}
      <section className="space-y-4">
        <div className="grid grid-cols-2 gap-4 p-1.5 bg-surface-container-low rounded-2xl">
           <button onClick={() => store.setAddressMode('saved')} className={`py-3 rounded-xl font-bold ${store.addressMode === 'saved' ? 'bg-primary text-white' : ''}`}>Saved</button>
           <button onClick={() => store.setAddressMode('custom')} className={`py-3 rounded-xl font-bold ${store.addressMode === 'custom' ? 'bg-primary text-white' : ''}`}>Custom</button>
        </div>
        
        {store.addressMode === 'saved' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             {DUMMY_SAVED_ADDRESSES.map((addr) => (
                <div key={addr.id} onClick={() => store.setSavedAddressId(addr.id)} className={`p-4 border rounded-2xl cursor-pointer ${store.delivery_address_id === addr.id ? 'border-primary bg-primary/5' : ''}`}>
                   <h4 className="font-bold text-sm">{addr.name}</h4>
                   {store.delivery_address_id === addr.id && <BiCheckCircle className="text-primary ml-auto" />}
                </div>
             ))}
           </div>
        )}
      </section>

      <SubmitButton label={isProcessing ? 'Calculating...' : 'Get Delivery Cost'} onClick={handlePreviewFee} />
    </div>
  );
}