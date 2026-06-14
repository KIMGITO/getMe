import Navigation from '@/layouts/nav/navigation';
import { useState } from 'react';
import {
  BiMap,
  BiCart,
  BiTime,
  BiPlus,
  BiTrash,
  BiChevronLeft,
  BiCheckCircle,
  BiNote,
  BiDollarCircle,
  BiRadioCircle,
  BiRadioCircleMarked,
  BiEraser,
  BiDownload,
  BiLoaderAlt,
  BiCheck,
  BiInfoCircle,
} from 'react-icons/bi';
import Input from '../components/UI/Input';
import SubmitButton from '../components/UI/submit-btn';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useOrderStore } from '@/stores/useOrderStore';
import MapClickHandler from '@/handlers/map-click';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Checkbox from '@/components/UI/CheckBox';

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
  const canAddMoreItems = store.isLastItemValid();
  const [isExporting, setIsExporting] = useState(false);
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);

  const validateItemsStep = () => {
    return store.items.every(
      (item) =>
        item.product_name?.trim() &&
        item.unit?.trim() &&
        (parseFloat(item.quantity?.toString()) || 0) > 0,
    );
  };

  const calculateEstimatedTotal = () => {
    return store.items.reduce((acc, item) => {
      const q = parseFloat(item.quantity?.toString()) || 0;
      const p = parseFloat(item.estimated_price_per_unit?.toString()) || 0;
      return acc + q * p;
    }, 0);
  };

  const handleExportToPDF = async () => {
    const targetElement = document.getElementById('report');
    if (!targetElement) {
      alert('Error: Target print manifest block container not found.');
      return;
    }

    setIsExporting(true);

    try {
      const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);

      const cleanTitle =
        store.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'order';
      pdf.save(`provisional_receipt_${cleanTitle}_${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF Generation Exception:', error);
      alert('Could not compile PDF asset document.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFinalSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful API ingestion pipelines
    setIsSubmittedSuccessfully(true);
    store.setStep('summary');
  };

  return (

      <div className="flex h-screen flex-col  h-full max-w-4xl w-full mx-auto bg-surface-container-lowest text-on-surface  elevation-5 my-4 rounded-2xl overflow-hidden font-sans antialiased">
        {/* Universal Management Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low z-10">
          <div className="flex items-center gap-3">
            {store.step !== 'market' && (
              <button
                onClick={() => {
                  if (store.step === 'items') store.setStep('market');
                  if (store.step === 'logistics') store.setStep('items');
                  if (store.step === 'delivery') store.setStep('logistics');
                  if ((store.step as string) === 'summary') {
                    setIsSubmittedSuccessfully(false);
                    store.setStep('delivery');
                  }
                }}
                className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors"
              >
                <BiChevronLeft className="text-2xl" />
              </button>
            )}
            <div>
              <h2 className="title-md font-black-tight tracking-tight">
                {store.step === 'market' && '1. Select Market Location'}
                {store.step === 'items' && '2. Build Shopping List Container'}
                {store.step === 'logistics' && '3. Order Manifest Attributes'}
                {store.step === 'delivery' &&
                  '4. Final Destination Configuration'}
                {(store.step as string) === 'summary' &&
                  '5. Provisional Pipeline Receipt'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsSubmittedSuccessfully(false);
              store.clearStore();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-error hover:bg-error/10 rounded-xl transition-all"
          >
            <BiEraser className="text-sm" /> Reset Data
          </button>
        </div>

        {/* --- STEP 1: MARKET --- */}
        {store.step === 'market' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 relative z-0 ">
              <MapContainer
                center={[store.market_location.lat, store.market_location.lng]}
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
            <div className="p-6 bg-surface border rounded-b-2xl  border-outline-variant space-y-4">
              <Input
                label="Market Label/Description Descriptor"
                variant="filled"
                optional
                placeholder="e.g. Diamond Plaza First Floor Groceries Hub"
                value={store.market_location.description || ''}
                onChange={(e) =>
                  store.updateMarketLocation(
                    store.market_location.lat,
                    store.market_location.lng,
                    e.target.value,
                  )
                }
              />
              <SubmitButton
                label="Continue to Shopping List"
                onClick={() => store.setStep('items')}
              />
            </div>
          </div>
        )}

        {/* --- STEP 2: ITEMS --- */}
        {store.step === 'items' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {store.items.map((item, index) => (
              <div
                key={index}
                className="p-5 border border-outline-variant rounded-2xl bg-surface-container-low space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className="label-lg text-primary font-bold">
                    Line Item {index + 1}
                  </span>
                  {store.items.length > 1 && (
                    <button
                      onClick={() => store.removeItem(index)}
                      className="text-error hover:bg-error/10 p-2 rounded-xl transition-colors"
                    >
                      <BiTrash className="text-base" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Product Name "
                    required
                    placeholder="Red Bulb Onions"
                    value={item.product_name || ''}
                    onChange={(e) =>
                      store.updateItem(index, { product_name: e.target.value })
                    }
                  />
                  <Input
                    label="Target Stall/Shop"
                    optional
                    placeholder="Mama Njugunas Store"
                    value={item.shop || ''}
                    onChange={(e) =>
                      store.updateItem(index, { shop: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Quantity "
                    required
                    type="number"
                    value={item.quantity?.toString() || ''}
                    onChange={(e) =>
                      store.updateItem(index, {
                        quantity: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <Input
                    label="Unit Dimensions "
                    required
                    placeholder="Bunch / Pack / KG"
                    value={item.unit || ''}
                    onChange={(e) =>
                      store.updateItem(index, { unit: e.target.value })
                    }
                  />
                  <Input
                    label="Est Price Per Unit (Ksh) "
                    required
                    type="number"
                    value={item.estimated_price_per_unit?.toString() || ''}
                    onChange={(e) =>
                      store.updateItem(index, {
                        estimated_price_per_unit:
                          parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                {/* Substitute Choice Checkbox Option */}
                <div className="flex items-center gap-3 pt-2">
                  <Checkbox
                    size="md"
                    variant="primary"
                    label="Allow substitutes"
                    description="Allow product substitute variables if missing or out of stock"
                    checked={!!item.allow_substitutes}
                    onChange={(e) =>
                      store.updateItem(index, {
                        allow_substitutes: e.target.checked,
                      })
                    }
                  />
                 
                </div>
              </div>
            ))}

            <button
              disabled={!canAddMoreItems}
              onClick={() => store.addItem()}
              className={`w-full py-4 px-2 border border-dashed rounded-2xl flex items-center justify-center gap-2 transition-all ${
                canAddMoreItems
                  ? 'border-primary text-primary hover:bg-primary/5 cursor-pointer font-bold'
                  : 'border-outline-variant text-outline-variant cursor-not-allowed opacity-60'
              }`}
            >
              <BiPlus />{' '}
              {canAddMoreItems
                ? 'Add Another Line Item'
                : 'Fill Required Fields Above to Unlock Next Item'}
            </button>

            <div className="pt-4 border-t border-outline-variant">
              <SubmitButton
                label="Proceed to Logistics Metadata"
                disabled={!validateItemsStep()}
                onClick={() => store.setStep('logistics')}
              />
            </div>
          </div>
        )}

        {/* --- STEP 3: LOGISTICS --- */}
        {store.step === 'logistics' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <Input
              label="Dynamic Order Title Reference"
              placeholder="Bi-Weekly Kitchen Restock Run"
              value={store.title || ''}
              onChange={(e) => store.updateLogistics({ title: e.target.value })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface-variant">
                  Preferred Target Pickup Time Window
                </label>
                <input
                  type="datetime-local"
                  className="w-full p-4 border border-outline bg-surface rounded-2xl text-on-surface focus:outline-none"
                  value={store.preferred_pickup_start_time || ''}
                  onChange={(e) =>
                    store.updateLogistics({
                      preferred_pickup_start_time: e.target.value,
                    })
                  }
                />
              </div>
              <Input
                label="Tip Amount (Ksh)"
                placeholder="e.g., 50 (Optional)"
                type="number"
                value={store.tip_amount?.toString() || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  store.updateLogistics({
                    tip_amount:
                      val === '' ? 0 : Math.max(0, parseFloat(val) || 0),
                  });
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-on-surface-variant">
                Rider Instructions (Optional)
              </label>
              <textarea
                className="w-full p-4 border border-outline bg-surface rounded-2xl text-on-surface focus:outline-none"
                rows={3}
                placeholder="Provide access control metrics..."
                value={store.note_for_rider || ''}
                onChange={(e) =>
                  store.updateLogistics({ note_for_rider: e.target.value })
                }
              />
            </div>

            <SubmitButton
              label="Continue to Final Destination Setup"
              onClick={() => store.setStep('delivery')}
            />
          </div>
        )}

        {/* --- STEP 4: DELIVERY --- */}
        {store.step === 'delivery' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 p-1.5 bg-surface-container-low border border-outline-variant rounded-2xl">
              <button
                type="button"
                onClick={() => store.setAddressMode('saved')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${store.addressMode === 'saved' ? 'bg-primary text-on-primary' : 'hover:bg-surface-variant text-on-surface-variant'}`}
              >
                {store.addressMode === 'saved' ? (
                  <BiRadioCircleMarked className="text-xl" />
                ) : (
                  <BiRadioCircle className="text-xl" />
                )}{' '}
                Use Saved Address
              </button>
              <button
                type="button"
                onClick={() => store.setAddressMode('custom')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${store.addressMode === 'custom' ? 'bg-primary text-on-primary' : 'hover:bg-surface-variant text-on-surface-variant'}`}
              >
                {store.addressMode === 'custom' ? (
                  <BiRadioCircleMarked className="text-xl" />
                ) : (
                  <BiRadioCircle className="text-xl" />
                )}{' '}
                One-Time Delivery Spot
              </button>
            </div>

            {store.addressMode === 'saved' && (
              <div className="space-y-3">
                <label className="text-xs font-black tracking-wide uppercase text-on-surface-variant">
                  Choose Registered Destination
                </label>
                {DUMMY_SAVED_ADDRESSES.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => store.setSavedAddressId(addr.id)}
                    className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-center justify-between ${store.delivery_address_id === addr.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-outline-variant hover:border-outline'}`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">
                        {addr.name}
                      </h4>
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
            )}

            {store.addressMode === 'custom' &&
              store.custom_delivery_location && (
                <div className="space-y-4 border border-outline-variant p-4 rounded-2xl bg-surface-container-low">
                  <div className="h-48 rounded-xl overflow-hidden border border-outline-variant z-0 relative">
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
                    label="Instant Address Notes"
                    placeholder="e.g. Red Apartment, Room 3A"
                    value={store.custom_delivery_location.description || ''}
                    onChange={(e) =>
                      store.updateCustomAddress({ description: e.target.value })
                    }
                  />
                </div>
              )}

            <form
              onSubmit={handleFinalSubmission}
              className="pt-6 border-t border-outline-variant"
            >
              <SubmitButton
                label="Submit & Generate Provisional Receipt"
                disabled={
                  (store.addressMode === 'saved' &&
                    !store.delivery_address_id) ||
                  (store.addressMode === 'custom' &&
                    !store.custom_delivery_location?.description?.trim())
                }
              />
            </form>
          </div>
        )}

        {/* --- STEP 5: PROVISIONAL RECEIPT VIEW CONTAINER --- */}
        {(store.step as string) === 'summary' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Top Export Bar Container */}
            <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-2xl border border-outline-variant">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant">
                  Document Actions
                </h4>
                <p className="text-xs font-medium text-on-surface">
                  Download verified structural pre-dispatch breakdown.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportToPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-700/40 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                {isExporting ? (
                  <>
                    <BiLoaderAlt className="animate-spin text-sm" />{' '}
                    Compiling...
                  </>
                ) : (
                  <>
                    <BiDownload className="text-sm" /> Download PDF Receipt
                  </>
                )}
              </button>
            </div>

            {/* --- PROVISIONAL INVOICE COMPILATION TARGET --- */}
            <div
              id="report"
              style={{
                backgroundColor: '#ffffff',
                color: '#18181b',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid #e4e4e7',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              {/* Header Context Labels */}
              <div
                style={{
                  borderBottom: '2px dashed #e4e4e7',
                  paddingBottom: '16px',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: '20px',
                        fontWeight: 900,
                        color: '#166534',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.025em',
                        margin: 0,
                      }}
                    >
                      Provisional Provisioning Receipt
                    </h2>
                    <p
                      style={{
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        color: '#71717a',
                        marginTop: '4px',
                      }}
                    >
                      Generated: {new Date().toLocaleString()}
                    </p>
                  </div>
                  <div
                    style={{
                      border: '1px solid #b45309',
                      backgroundColor: '#fef3c7',
                      padding: '4px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 'bold',
                        color: '#b45309',
                        textTransform: 'uppercase',
                      }}
                    >
                      Pre-Dispatch Statement
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginTop: '16px',
                    backgroundColor: '#fafafa',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #f4f4f5',
                    fontSize: '11px',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 'bold',
                        color: '#a1a1aa',
                        textTransform: 'uppercase',
                        display: 'block',
                      }}
                    >
                      Manifest Run Reference
                    </span>
                    <p
                      style={{
                        fontWeight: 600,
                        color: '#27272a',
                        margin: '2px 0 0 0',
                      }}
                    >
                      {store.title || 'Asynchronous Market Fulfillment Run'}
                    </p>
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 'bold',
                        color: '#a1a1aa',
                        textTransform: 'uppercase',
                        display: 'block',
                      }}
                    >
                      Transit Target Schedule
                    </span>
                    <p
                      style={{
                        fontWeight: 600,
                        color: '#27272a',
                        margin: '2px 0 0 0',
                      }}
                    >
                      {store.preferred_pickup_start_time
                        ? new Date(
                            store.preferred_pickup_start_time,
                          ).toLocaleString()
                        : 'Immediate Assignment Queue'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Node Tracking Box Blocks */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  fontSize: '11px',
                }}
              >
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: '#fafafa',
                    border: '1px solid #f4f4f5',
                  }}
                >
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 900,
                      color: '#166534',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '2px',
                    }}
                  >
                    Origin Market Node
                  </span>
                  <p style={{ fontWeight: 600, color: '#3f3f46', margin: 0 }}>
                    {store.market_location.description ||
                      'Pinned Market Coordinates'}
                  </p>
                  <p
                    style={{
                      fontSize: '9px',
                      fontFamily: 'monospace',
                      color: '#a1a1aa',
                      marginTop: '4px',
                      margin: 0,
                    }}
                  >
                    Lat: {store.market_location.lat.toFixed(4)}, Lng:{' '}
                    {store.market_location.lng.toFixed(4)}
                  </p>
                </div>
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: '#fafafa',
                    border: '1px solid #f4f4f5',
                  }}
                >
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 900,
                      color: '#991b1b',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '2px',
                    }}
                  >
                    Target Delivery Destination
                  </span>
                  <p style={{ fontWeight: 600, color: '#3f3f46', margin: 0 }}>
                    {store.addressMode === 'saved'
                      ? DUMMY_SAVED_ADDRESSES.find(
                          (a) => a.id === store.delivery_address_id,
                        )?.name +
                        ' (' +
                        DUMMY_SAVED_ADDRESSES.find(
                          (a) => a.id === store.delivery_address_id,
                        )?.details +
                        ')'
                      : store.custom_delivery_location?.description}
                  </p>
                </div>
              </div>

              {/* Itemized Table Breakdown */}
              <div
                style={{
                  border: '1px solid #e4e4e7',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                  fontSize: '11px',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    backgroundColor: '#fafafa',
                    padding: '10px 12px',
                    fontWeight: 'bold',
                    borderBottom: '1px solid #e4e4e7',
                    fontSize: '9px',
                    color: '#71717a',
                    textTransform: 'uppercase',
                  }}
                >
                  <span>Product Spec</span>
                  <span style={{ textAlign: 'center' }}>Qty</span>
                  <span style={{ textAlign: 'center' }}>Substitute</span>
                  <span style={{ textAlign: 'right' }}>Est Subtotal</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {store.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr',
                        padding: '10px 12px',
                        alignItems: 'center',
                        borderBottom:
                          idx !== store.items.length - 1
                            ? '1px solid #f4f4f5'
                            : 'none',
                        color: '#3f3f46',
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontWeight: 'bold',
                            color: '#18181b',
                            margin: 0,
                          }}
                        >
                          {item.product_name}
                        </p>
                        {item.shop && (
                          <p
                            style={{
                              fontSize: '9px',
                              color: '#a1a1aa',
                              margin: 0,
                            }}
                          >
                            Shop: {item.shop}
                          </p>
                        )}
                      </div>
                      <span
                        style={{
                          textAlign: 'center',
                          fontWeight: 600,
                          fontFamily: 'monospace',
                        }}
                      >
                        {item.quantity} {item.unit}
                      </span>
                      <span
                        style={{
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: item.allow_substitutes ? '#166534' : '#71717a',
                        }}
                      >
                        {item.allow_substitutes ? 'YES' : 'NO'}
                      </span>
                      <span
                        style={{
                          textAlign: 'right',
                          fontWeight: 'bold',
                          fontFamily: 'monospace',
                          color: '#18181b',
                        }}
                      >
                        Ksh{' '}
                        {(
                          (parseFloat(item.quantity?.toString()) || 0) *
                          (parseFloat(
                            item.estimated_price_per_unit?.toString(),
                          ) || 0)
                        ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Totals Card Ledger */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Dynamic Information Alert Banner */}
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '10px',
                    color: '#1e40af',
                  }}
                >
                  <BiInfoCircle style={{ fontSize: '14px', flexShrink: 0 }} />
                  <span>
                    <strong>Provisional Notice:</strong> Delivery fees, system
                    processing premiums, and verified rider matching metrics
                    will calculate dynamically over delivery distance paths
                    instantly upon execution ingestion.
                  </span>
                </div>

                <div
                  style={{
                    padding: '12px',
                    backgroundColor: '#fafafa',
                    borderRadius: '12px',
                    border: '1px solid #f4f4f5',
                    width: '100%',
                    maxWidth: '300px',
                    alignSelf: 'flex-end',
                    fontSize: '11px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: '#71717a',
                    }}
                  >
                    <span>Estimated Items Total:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      Ksh{' '}
                      {calculateEstimatedTotal().toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: '#71717a',
                    }}
                  >
                    <span>Allocated Rider Tip:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      Ksh{' '}
                      {(
                        parseFloat(store.tip_amount?.toString()) || 0
                      ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: '#a1a1aa',
                      fontStyle: 'italic',
                    }}
                  >
                    <span>Distance Logistic Fee:</span>
                    <span>Pending Dispatch...</span>
                  </div>
                  <div
                    style={{
                      borderTop: '1px dashed #e4e4e7',
                      paddingTop: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: '#18181b',
                      fontWeight: 'extrabold',
                    }}
                  >
                    <span
                      style={{
                        color: '#166534',
                        textTransform: 'uppercase',
                        fontSize: '10px',
                      }}
                    >
                      Base Running Floor:
                    </span>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        color: '#166534',
                      }}
                    >
                      Ksh{' '}
                      {(
                        calculateEstimatedTotal() +
                        (parseFloat(store.tip_amount?.toString()) || 0)
                      ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informative Step-Completion Status box below document wrapper */}
            {isSubmittedSuccessfully && (
              <div className="bg-green-50 text-green-800 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
                <BiCheckCircle className="text-xl text-green-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">
                    Order Payload Compiled Successfully!
                  </p>
                  <p className="text-green-700/90 font-medium">
                    Your request sequence has successfully resolved to your
                    operational database. Download your provisional tracking run
                    file above.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
  );
}
