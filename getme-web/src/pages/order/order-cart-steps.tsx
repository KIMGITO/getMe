import React, { useState } from 'react';
import { BiPlus, BiTrash, BiErrorCircle } from 'react-icons/bi';
import { useOrderStore } from '@/stores/useOrderStore';
import { shoppingService } from '@/services/shoppingService';
import Input from '@/components/UI/Input';
import SubmitButton from '@/components/UI/submit-btn';
import Checkbox from '@/components/UI/CheckBox';

export default function OrderCartStep() {
  const store = useOrderStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [draftItem, setDraftItem] = useState({
    product_name: '', quantity: '', unit: '', estimated_price_per_unit: '', shop: '', substitute_allowed: true, notes: ''
  });

  const handleAddItem = () => {
    if (!draftItem.product_name || !draftItem.quantity) return;
    store.addItem({
      product_name: draftItem.product_name,
      unit: draftItem.unit || 'pcs',
      quantity: parseFloat(draftItem.quantity),
      substitute_allowed: draftItem.substitute_allowed,
      estimated_price_per_unit: parseFloat(draftItem.estimated_price_per_unit) || 0,
      shop: draftItem.shop || undefined,
      notes: draftItem.notes || undefined,
    });
    setDraftItem({ product_name: '', quantity: '', unit: '', estimated_price_per_unit: '', shop: '', substitute_allowed: true, notes: '' });
  };

  const handleSaveDraftList = async () => {
    setIsProcessing(true);
    setFieldErrors({});
    try {
      const payload = { title: store.title || null, preferred_pickup_start_time: store.preferred_pickup_start_time || null, note_for_rider: store.note_for_rider || null, items: store.items };
      const result = await shoppingService.createList(payload);
      if (result.success) {
        store.setShoppingListId(result.shopping_list_id);
        store.setStep('route');
      }
    } catch (error) {
      setFieldErrors(shoppingService.parseValidationErrors(error));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {fieldErrors && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-xl text-sm flex items-center gap-2">
          <BiErrorCircle /> {fieldErrors.message}
        </div>
      )}
      
      {/* Metadata Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Order Reference Name" value={store.title} onChange={(e) => store.updateLogistics({ title: e.target.value })} error={fieldErrors.title} />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-on-surface-variant">Preferred Pickup Time</label>
          <input type="datetime-local" className="w-full p-4 border bg-surface rounded-2xl" value={store.preferred_pickup_start_time} onChange={(e) => store.updateLogistics({ preferred_pickup_start_time: e.target.value })} />
        </div>
      </section>

      {/* List Builder */}
      <section className="space-y-4">
        <h3 className="font-bold text-sm uppercase text-on-surface-variant">Shopping List Basket</h3>
        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant space-y-4">
           <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 md:col-span-4"><Input label="Item Name" value={draftItem.product_name} onChange={(e) => setDraftItem({...draftItem, product_name: e.target.value})} /></div>
              <div className="col-span-4 md:col-span-2"><Input label="Qty" type="number" value={draftItem.quantity} onChange={(e) => setDraftItem({...draftItem, quantity: e.target.value})} /></div>
              <div className="col-span-4 md:col-span-2"><Input label="Unit" value={draftItem.unit} onChange={(e) => setDraftItem({...draftItem, unit: e.target.value})} /></div>
              <div className="col-span-4 md:col-span-4"><Input label="Est. Price" type="number" value={draftItem.estimated_price_per_unit} onChange={(e) => setDraftItem({...draftItem, estimated_price_per_unit: e.target.value})} /></div>
           </div>
           <div className="flex justify-between items-center border-t border-outline-variant pt-3 mt-2">
              <Checkbox label="Allow Substitutes" checked={draftItem.substitute_allowed} onChange={(e) => setDraftItem({...draftItem, substitute_allowed: e.target.checked})} />
              <button type="button" onClick={handleAddItem} disabled={!draftItem.product_name || !draftItem.quantity} className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-2">
                <BiPlus /> Add to List
              </button>
           </div>
        </div>

        <div className="space-y-2">
          {store.items.map((item, idx) => (
            <div key={idx} className="p-4 bg-surface flex justify-between items-center border rounded-xl">
               <p className="font-bold">{item.quantity} {item.unit} x {item.product_name}</p>
               <button onClick={() => store.removeItem(idx)} className="text-error"><BiTrash /></button>
            </div>
          ))}
        </div>
      </section>

      <SubmitButton label={isProcessing ? 'Saving...' : 'Save List & Continue'} onClick={handleSaveDraftList} disabled={store.items.length === 0 || isProcessing} />
    </div>
  );
}