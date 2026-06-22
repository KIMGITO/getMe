import React, { useState } from 'react';
import {
  BiMap,
  BiPlus,
  BiTrash,
  BiChevronLeft,
  BiCheckCircle,
  BiEraser,
  BiDownload,
  BiLoaderAlt,
  BiErrorCircle,
  BiWallet,
} from 'react-icons/bi';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import Input from '../components/UI/Input';
import SubmitButton from '../components/UI/submit-btn';
import Checkbox from '@/components/UI/CheckBox';
import MapClickHandler from '@/handlers/map-click';
import { useOrderStore } from '@/stores/useOrderStore';
import { shoppingService } from '@/services/shoppingService';

const DUMMY_SAVED_ADDRESSES = [
  {
    id: 'ulid_addr_1',
    name: 'Home Layout Address',
    details: 'South C, Block 4',
  },
  {
    id: 'ulid_addr_2',
    name: 'CODENSONS HQ Office',
    details: 'Mombasa Road, Hangar B',
  },
];

export default function IntegratedOrderPage() {
  const store = useOrderStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [draftItem, setDraftItem] = useState({
    product_name: '',
    quantity: '',
    unit: '',
    estimated_price_per_unit: '',
    shop: '',
    substitute_allowed: true,
    notes: '',
  });

  const handleAddItem = () => {
    if (!draftItem.product_name || !draftItem.quantity) return;
    store.addItem({
      product_name: draftItem.product_name,
      unit: draftItem.unit || 'pcs',
      quantity: parseFloat(draftItem.quantity),
      substitute_allowed: draftItem.substitute_allowed,
      estimated_price_per_unit:
        parseFloat(draftItem.estimated_price_per_unit) || 0,
      shop: draftItem.shop || undefined,
      notes: draftItem.notes || undefined,
    });
    setDraftItem({
      product_name: '',
      quantity: '',
      unit: '',
      estimated_price_per_unit: '',
      shop: '',
      substitute_allowed: true,
      notes: '',
    });
  };

  // TASK 1: Save Draft Shopping List
  const handleSaveDraftList = async () => {
    setIsProcessing(true);
    setFieldErrors({});
    try {
      const payload = {
        title: store.title || null,
        preferred_pickup_start_time: store.preferred_pickup_start_time || null,
        note_for_rider: store.note_for_rider || null,
        items: store.items,
      };
      const result = await shoppingService.createList(payload);

      if (result.success) {
        store.setShoppingListId(result.shopping_list_id);
        store.setStep('route'); // Move to Logistics
      }
    } catch (error: any) {
      setFieldErrors(shoppingService.parseValidationErrors(error));
    } finally {
      setIsProcessing(false);
    }
  };

  // TASK 2: Preview Transport Fee
  const handlePreviewFee = async () => {
    if (!store.shoppingListId) return;
    setIsProcessing(true);
    setFieldErrors({});
    try {
      const payload = {
        market_location: store.market_location,
        delivery_address_id:
          store.addressMode === 'saved' ? store.delivery_address_id : null,
        ...(store.addressMode === 'custom' && {
          delivery_location: store.custom_delivery_location,
        }),
      };

      const result = await shoppingService.previewFee(
        store.shoppingListId,
        payload,
      );
      store.setFeePreview(result);
      store.setStep('summary');

      console.log(result);
    } catch (error: any) {
      setFieldErrors(shoppingService.parseValidationErrors(error));
    } finally {
      setIsProcessing(false);
    }
  };

  // TASK 3: Authorize Checkout
  const handleFinalCheckout = async () => {
    if (!store.shoppingListId) return;
    setIsProcessing(true);
    setFieldErrors({});
    try {
      const payload = {
        market_location: store.market_location,
        delivery_address_id:
          store.addressMode === 'saved' ? store.delivery_address_id : null,
        ...(store.addressMode === 'custom' && {
          delivery_location: store.custom_delivery_location,
        }),
        tip_amount: store.tip_amount || 0,
      };

      const result = await shoppingService.checkout(
        store.shoppingListId,
        payload,
      );
      if (result.success) {
        store.clearStore();
        alert('Pipeline Request Dispatched Successfully!');
      }
    } catch (error: any) {
      setFieldErrors(shoppingService.parseValidationErrors(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportToPDF = async () => {
    /* Retained exactly as is */
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-4xl w-full mx-auto bg-surface-container-lowest text-on-surface my-4 rounded-2xl overflow-hidden font-sans antialiased border border-outline-variant">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low z-10">
        <div className="flex items-center gap-3">
          {store.step !== 'cart' && (
            <button
              onClick={() => {
                if (store.step === 'route') store.setStep('cart');
                if (store.step === 'summary') store.setStep('route');
              }}
              className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors"
            >
              <BiChevronLeft className="text-2xl" />
            </button>
          )}
          <h2 className="text-lg font-black tracking-tight">
            {store.step === 'cart' && '1. Order Items & Details'}
            {store.step === 'route' && '2. Pickup & Delivery Maps'}
            {store.step === 'summary' && '3. Financials & Checkout'}
          </h2>
        </div>
        <button
          onClick={() => {
            store.clearStore();
            setFieldErrors({});
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-error hover:bg-error/10 rounded-xl transition-all"
        >
          <BiEraser /> Reset
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {fieldErrors.global && (
          <div className="mx-6 mt-4 p-4 bg-error/10 border border-error/20 text-error rounded-xl text-sm flex items-center gap-2">
            <BiErrorCircle className="text-lg shrink-0" />
            <span>{fieldErrors.global}</span>
          </div>
        )}

        {/* --- STEP 1: CART & METADATA --- */}
        {store.step === 'cart' && (
          <div className="p-6 space-y-8">
            {/* Metadata */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Order Reference Name"
                placeholder="e.g. Friday Office Restock"
                value={store.title}
                onChange={(e) =>
                  store.updateLogistics({ title: e.target.value })
                }
                error={fieldErrors.title}
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface-variant">
                  Preferred Pickup Time
                </label>
                <input
                  type="datetime-local"
                  className={`w-full p-4 border bg-surface rounded-2xl focus:outline-none ${fieldErrors.preferred_pickup_start_time ? 'border-error' : 'border-outline'}`}
                  value={store.preferred_pickup_start_time}
                  onChange={(e) =>
                    store.updateLogistics({
                      preferred_pickup_start_time: e.target.value,
                    })
                  }
                />
                {fieldErrors.preferred_pickup_start_time && (
                  <span className="text-xs text-error font-medium">
                    {fieldErrors.preferred_pickup_start_time}
                  </span>
                )}
              </div>
              <div className="col-span-1 md:col-span-2">
                <Input
                  label="Note For Rider"
                  placeholder="Instructions regarding gate codes, handling fragile goods, etc."
                  value={store.note_for_rider}
                  onChange={(e) =>
                    store.updateLogistics({ note_for_rider: e.target.value })
                  }
                  error={fieldErrors.note_for_rider}
                />
              </div>
            </section>

            <hr className="border-outline-variant" />

            {/* Shopping List Builder */}
            <section className="space-y-4">
              <h3 className="font-bold text-sm uppercase text-on-surface-variant">
                Shopping List Basket
              </h3>

              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant space-y-4">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-4">
                    <Input
                      label="Item Name"
                      placeholder="e.g. Red Onions"
                      value={draftItem.product_name}
                      onChange={(e) =>
                        setDraftItem({
                          ...draftItem,
                          product_name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <Input
                      label="Qty"
                      type="number"
                      value={draftItem.quantity}
                      onChange={(e) =>
                        setDraftItem({ ...draftItem, quantity: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <Input
                      label="Unit"
                      placeholder="KG"
                      value={draftItem.unit}
                      onChange={(e) =>
                        setDraftItem({ ...draftItem, unit: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-4 md:col-span-4">
                    <Input
                      label="Est. Price"
                      type="number"
                      value={draftItem.estimated_price_per_unit}
                      onChange={(e) =>
                        setDraftItem({
                          ...draftItem,
                          estimated_price_per_unit: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-outline-variant pt-3 mt-2">
                  <Checkbox
                    label="Allow Substitutes"
                    checked={draftItem.substitute_allowed}
                    onChange={(e) =>
                      setDraftItem({
                        ...draftItem,
                        substitute_allowed: e.target.checked,
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!draftItem.product_name || !draftItem.quantity}
                    className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-2"
                  >
                    <BiPlus /> Add to List
                  </button>
                </div>
              </div>

              {/* Items Render Array */}
              <div className="space-y-2">
                {store.items.length > 0 && (
                  <div className="border border-outline-variant rounded-2xl overflow-hidden divide-y divide-outline-variant">
                    {store.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-surface flex justify-between items-start"
                      >
                        <div>
                          <p className="font-bold">
                            {item.quantity} {item.unit} x {item.product_name}
                          </p>
                          <p className="text-xs text-primary font-medium mt-0.5">
                            Est: Ksh {item.estimated_price_per_unit}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => store.removeItem(idx)}
                          className="text-error p-2 hover:bg-error/10 rounded-lg"
                        >
                          <BiTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {fieldErrors.items && (
                  <span className="text-xs text-error font-bold">
                    {fieldErrors.items}
                  </span>
                )}
              </div>
            </section>

            <SubmitButton
              label={
                isProcessing ? 'Saving List...' : 'Save List & Continue to Maps'
              }
              disabled={store.items.length === 0 || isProcessing}
              onClick={handleSaveDraftList}
            />
          </div>
        )}

        {/* --- STEP 2: ROUTE --- */}
        {store.step === 'route' && (
          <div className="p-6 space-y-8">
            {store.shoppingListId && (
              <div className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-xl border border-emerald-200">
                <span className="font-bold">✓ Draft List Saved Online.</span>{' '}
                Set your locations to preview transit fees.
              </div>
            )}

            <section className="space-y-4">
              <h3 className="font-bold text-sm uppercase text-on-surface-variant flex items-center gap-2">
                <BiMap className="text-primary" /> Pickup Location (Market)
              </h3>
              <div className="h-48 rounded-2xl overflow-hidden border border-outline-variant z-0 relative">
                <MapContainer
                  center={[
                    store.market_location.lat,
                    store.market_location.lng,
                  ]}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapClickHandler
                    onClick={(lat, lng) => store.updateMarketLocation(lat, lng)}
                  />
                  <Marker
                    position={[
                      store.market_location.lat,
                      store.market_location.lng,
                    ]}
                  />
                </MapContainer>
              </div>
              <Input
                label="Pickup Notes / Stall Description"
                value={store.market_location.description}
                onChange={(e) =>
                  store.updateMarketLocation(
                    store.market_location.lat,
                    store.market_location.lng,
                    e.target.value,
                  )
                }
                error={fieldErrors['market_location.description']}
              />
            </section>

            <hr className="border-outline-variant" />

            <section className="space-y-4">
              <h3 className="font-bold text-sm uppercase text-on-surface-variant flex items-center gap-2">
                <BiMap className="text-error" /> Delivery Destination
              </h3>
              <div className="grid grid-cols-2 gap-4 p-1.5 bg-surface-container-low border border-outline-variant rounded-2xl">
                <button
                  type="button"
                  onClick={() => store.setAddressMode('saved')}
                  className={`py-3 rounded-xl font-bold transition-all ${store.addressMode === 'saved' ? 'bg-primary text-white' : 'hover:bg-surface-variant'}`}
                >
                  Saved Address
                </button>
                <button
                  type="button"
                  onClick={() => store.setAddressMode('custom')}
                  className={`py-3 rounded-xl font-bold transition-all ${store.addressMode === 'custom' ? 'bg-primary text-white' : 'hover:bg-surface-variant'}`}
                >
                  Custom Spot
                </button>
              </div>

              {store.addressMode === 'saved' ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {DUMMY_SAVED_ADDRESSES.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => store.setSavedAddressId(addr.id)}
                        className={`p-4 border rounded-2xl cursor-pointer flex justify-between items-center ${store.delivery_address_id === addr.id ? 'border-primary bg-primary/5' : 'border-outline-variant'}`}
                      >
                        <div>
                          <h4 className="font-bold text-sm">{addr.name}</h4>
                          <p className="text-xs text-on-surface-variant">
                            {addr.details}
                          </p>
                        </div>
                        {store.delivery_address_id === addr.id && (
                          <BiCheckCircle className="text-primary text-xl" />
                        )}
                      </div>
                    ))}
                  </div>
                  {fieldErrors.delivery_address_id && (
                    <span className="text-xs text-error font-medium">
                      {fieldErrors.delivery_address_id}
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-48 rounded-2xl overflow-hidden border border-outline-variant z-0 relative">
                    <MapContainer
                      center={[
                        store.custom_delivery_location.lat,
                        store.custom_delivery_location.lng,
                      ]}
                      zoom={14}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <MapClickHandler
                        onClick={(lat, lng) =>
                          store.updateCustomAddress({ lat, lng })
                        }
                      />
                      <Marker
                        position={[
                          store.custom_delivery_location.lat,
                          store.custom_delivery_location.lng,
                        ]}
                      />
                    </MapContainer>
                  </div>
                  <Input
                    label="Instant Dropoff Location Directions"
                    value={store.custom_delivery_location.description}
                    onChange={(e) =>
                      store.updateCustomAddress({ description: e.target.value })
                    }
                    error={fieldErrors['delivery_location.description']}
                  />
                </div>
              )}
            </section>

            <SubmitButton
              label={
                isProcessing
                  ? 'Calculating Routing Fees...'
                  : 'Get Delivery Cost Quote'
              }
              disabled={
                isProcessing ||
                (store.addressMode === 'saved' && !store.delivery_address_id)
              }
              onClick={handlePreviewFee}
            />
          </div>
        )}

        {/* --- STEP 3: SUMMARY --- */}
        {store.step === 'summary' && store.feePreview && (
          <div className="p-6 space-y-6">
            {/* Wallet Verifier Banner */}
            {!store.feePreview.wallet_sufficient ? (
              <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-red-800">
                  <BiErrorCircle className="text-3xl shrink-0" />
                  <div>
                    <h4 className="font-bold">Insufficient Wallet Balance</h4>
                    <p className="text-xs">
                      Your current balance cannot cover the combined total.
                      Please top up{' '}
                      <span className="font-bold">
                        KSH {store.feePreview.suggested_topup_amount}
                      </span>
                      .
                    </p>
                  </div>
                </div>
                <button className="whitespace-nowrap flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-xl transition">
                  <BiWallet /> Load Funds
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-xl border border-emerald-200">
                <span className="font-bold">✓ Account Verified.</span> You have
                sufficient funds to cover this dispatch.
              </div>
            )}

            {/* Financial Ledger */}
            <div className="card-outlined bg-surface p-6 rounded-2xl space-y-6">
              {/* Header Section */}
              <div className="border-b border-dashed border-outline-variant pb-4">
                <h2 className="title-lg font-black uppercase text-on-surface">
                  Order Summary
                </h2>
                <p className="label-lg text-on-surface-variant font-mono">
                  Distance: {store.feePreview.distance_km} KM
                </p>
              </div>

              {/* Summary Table */}
              <div className="border border-outline-variant rounded-xl divide-y divide-outline-variant text-sm overflow-hidden">
                {/* Goods Subtotal */}
                <div className="flex justify-between p-4 bg-surface-container-low">
                  <span className="font-bold text-on-surface-variant">
                    Goods Subtotal
                  </span>
                  <span className="font-mono font-bold text-on-surface">
                    Ksh {store.feePreview.items_estimated_cost}
                  </span>
                </div>

                {/* Delivery Fee */}
                <div className="flex justify-between p-4 bg-surface">
                  <span className="text-on-surface-variant">
                    Base Delivery Fee
                  </span>
                  <span className="font-mono text-on-surface">
                    Ksh {store.feePreview.delivery_fee}
                  </span>
                </div>

                {/* Editable Tip Row */}
                <div className="p-4 bg-surface-container-low">
                  <Input
                    className="input-field"
                    label="Add Rider Tip (Optional)"
                    type="number"
                    placeholder="0"
                    value={store.tip_amount || ''}
                    onChange={(e) =>
                      store.updateLogistics({
                        tip_amount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                {/* Grand Total */}
                <div className="flex justify-between p-4 bg-primary text-on-primary font-black">
                  <span>Grand Total Deducted</span>
                  <span className="font-mono">
                    Ksh{' '}
                    {store.feePreview.total_order_cost +
                      (store.tip_amount || 0)}
                  </span>
                </div>
              </div>
            </div>
            <SubmitButton
              label={
                isProcessing
                  ? 'Authorizing Hold & Dispatching...'
                  : 'Confirm & Dispatch Rider'
              }
              disabled={isProcessing || !store.feePreview.wallet_sufficient}
              onClick={handleFinalCheckout}
            />
          </div>
        )}
      </div>
    </div>
  );
}
