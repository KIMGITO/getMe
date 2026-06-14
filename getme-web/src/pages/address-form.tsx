import { useState } from 'react';

import {
  BiMap,
  BiHome,
  BiBuilding,
  BiInfoCircle,
  BiNavigation,
  BiStar,
  BiCheckCircle,
  BiX,
  BiChevronLeft,
} from 'react-icons/bi';
import Input from '../components/UI/Input';
import SubmitButton from '../components/UI/submit-btn';

// react-leaflet setup
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { HiMiniBars2 } from 'react-icons/hi2';
import LocationMarker from '@/components/UI/LocationMarker';
import AuthLayout from '@/layouts/auth-layout';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const NAIROBI_CENTER: [number, number] = [-1.286389, 36.817223];

interface AddressFormData {
  name: string;
  land_mark: string;
  city: string;
  street: string;
  estate: string;
  house_number: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  is_default: boolean;
}

interface AddressFormProps {
  onSubmit?: (data: AddressFormData) => void;
  initialData?: Partial<AddressFormData>;
  height?: string;
}

function AddressForm({
  onSubmit,
  initialData = {},
  height = 'h-screen ',
}: AddressFormProps) {
  const [step, setStep] = useState<'map' | 'details'>('map');
  const [showInstruction, setShowInstruction] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(
    initialData.latitude && initialData.longitude
      ? { lat: initialData.latitude, lng: initialData.longitude }
      : null,
  );

  const [formData, setFormData] = useState<AddressFormData>({
    name: initialData.name || '',
    land_mark: initialData.land_mark || '',
    city: initialData.city || '',
    street: initialData.street || '',
    estate: initialData.estate || '',
    house_number: initialData.house_number || '',
    latitude: initialData.latitude || null,
    longitude: initialData.longitude || null,
    description: initialData.description || '',
    is_default: initialData.is_default || false,
  });

  const handleInputChange = (field: keyof AddressFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleContinueToDetails = () => {
    if (selectedLocation) {
      setStep('details');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const mapCenter = selectedLocation
    ? ([selectedLocation.lat, selectedLocation.lng] as [number, number])
    : NAIROBI_CENTER;

  return (
      <section
        className={`flex flex-col ${height} mb-16 lg:mb-0 max-w-screen-md w-full mx-auto bg-surface-container-lowest text-on-surface rounded-3xl shadow-elevation-3 border border-outline-variant overflow-hidden font-sans antialiased`}
      >
        {/* Header Viewport */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low z-10">
          <div className="flex items-center gap-3">
            {step === 'details' ? (
              <button
                type="button"
                onClick={() => setStep('map')}
                className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors text-on-surface"
                aria-label="Back to map view"
              >
                <BiChevronLeft className="text-2xl" />
              </button>
            ) : (
              <div className="p-2 bg-primary-container rounded-xl text-on-primary-container">
                <BiMap className="text-xl" />
              </div>
            )}
            <div>
              <h2 className="title-md font-black-tight text-black-ultra  tracking-tight">
                {step === 'map' ? 'Verify Coordinates' : 'Delivery Specifics'}
              </h2>
              <p className="body-sm text-on-surface-variant">
                {step === 'map'
                  ? 'Step 1 of 2: Map Placement'
                  : 'Step 2 of 2: Destination metadata'}
              </p>
            </div>
          </div>

          {/* Step Progression Pips */}
          <div className="flex items-center gap-1.5 bg-surface-variant px-3 py-1.5 rounded-full">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${step === 'map' ? 'bg-primary w-6' : 'bg-success'}`}
            />
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${step === 'details' ? 'bg-primary w-6' : 'bg-outline'}`}
            />
          </div>
        </div>

        {/* Map Segment Wrapper */}
        <div
          className={`${step === 'map' ? 'flex-1' : 'h-10'}  relative transition-all duration-300 ease-in-out  border-outline-variant z-0 shadow-inner`}
        >
          <MapContainer
            center={mapCenter}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker
              onLocationSelect={handleLocationSelect}
              position={
                selectedLocation
                  ? [selectedLocation.lat, selectedLocation.lng]
                  : null
              }
            />
          </MapContainer>

          {/* MD3 Float Action Dismissible Banner */}
          {step === 'map' && showInstruction && (
            <div className="absolute top-4 inset-x-4 mx-auto max-w-xs z-[400] ">
              <div className="bg-surface backdrop-blur-md rounded-2xl p-4 elevation-4 border border-outline-variant relative flex gap-3 items-start">
                <div className="p-2 bg-tertiary-container text-on-tertiary-container rounded-xl">
                  <BiNavigation className="text-xl animate-pulse" />
                </div>
                <div className="flex-1 pr-4 ">
                  <h4 className="text-xs font-black-tight text-black-heavy  text-tertiary-fixed-dim">
                    Geotag Pinned
                  </h4>
                  <p className="body-sm text-on-surface-variant mt-0.5">
                    Tap your exact dropoff target position on the map layout
                    grid.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInstruction(false)}
                  className="text-on-surface-variant hover:bg-surface-variant p-1 rounded-lg transition-colors absolute top-2 right-2"
                  aria-label="Dismiss banner"
                >
                  <BiX className="text-lg" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Docking Point (Map Step Confirmation View) */}
        {step === 'map' && (
          <div className="px-4    elevation-5 bg-surface py-6 z-10 transition-all duration-200">
            {selectedLocation ? (
              <div className="space-y-4 animate-slide-up">
                <div className="px-4 py-3 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BiCheckCircle className="text-success text-2xl" />
                    <div>
                      <span className="stat-label text-success block">
                        Anchor Lock Verified
                      </span>
                      <span className="font-mono label-md text-on-surface-variant tracking-normal">
                        {selectedLocation.lat.toFixed(6)}° N ,{' '}
                        {selectedLocation.lng.toFixed(6)}° E
                      </span>
                    </div>
                  </div>
                </div>
                <SubmitButton
                  onClick={handleContinueToDetails}
                  label="Save Adress"
                />
              </div>
            ) : (
              <div className="text-center text-primary    rounded animate-pulse">
                <span className="stat-label  block">
                  Awaiting Geolocation Data
                </span>
                <p className="body-sm ">
                  Tap the map view layer above to enable data compilation form
                  routes
                </p>
              </div>
            )}
          </div>
        )}

        {/* Meta Configuration Details Form */}
        {step === 'details' && (
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto bg-surface-container-lowest z-10 animate-slide-up"
          >
            <div className="p-6 space-y-6">
              {/* Alias Section Title */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="stat-label text-primary flex items-center gap-2">
                    <BiMap className="text-lg" />
                    Address Identity Alias
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep('map')}
                    className="p-2 -ml-2 rounded-lg hover:bg-surface-variant transition-colors text-on-surface"
                    aria-label="Back to map view"
                  >
                    <HiMiniBars2 className="text-2xl text-primary" />
                  </button>
                </div>
                <Input
                  label=""
                  variant="flushed"
                  placeholder="e.g., CODENSONS Head Office, Warehouse B"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              {/* Layout Grid Segment A */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <span className="stat-label text-on-surface-variant flex items-center gap-1.5">
                    <BiHome className="text-base" /> Street Line
                  </span>
                  <Input
                    label=""
                    variant="flushed"
                    placeholder="Mombasa Road / Avenue"
                    value={formData.street}
                    onChange={(e) =>
                      handleInputChange('street', e.target.value)
                    }
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="stat-label text-on-surface-variant flex items-center gap-1.5">
                    <BiBuilding className="text-base" /> Estate Block
                  </span>
                  <Input
                    label=""
                    variant="flushed"
                    placeholder="South C / Industrial Area"
                    value={formData.estate}
                    onChange={(e) =>
                      handleInputChange('estate', e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {/* Layout Grid Segment B */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <span className="stat-label text-on-surface-variant">
                    House / Suite / Office No.
                  </span>
                  <Input
                    label=""
                    variant="flushed"
                    placeholder="Suite 4B / Hangar 2"
                    value={formData.house_number}
                    onChange={(e) =>
                      handleInputChange('house_number', e.target.value)
                    }
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="stat-label text-on-surface-variant">
                    City Hub
                  </span>
                  <Input
                    label=""
                    variant="flushed"
                    placeholder="Nairobi"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
              </div>

              {/* Visual Landmark Anchor Input */}
              <div className="flex flex-col gap-2">
                <span className="stat-label text-on-surface-variant flex items-center gap-1.5">
                  <BiInfoCircle className="text-base" /> Visual Orientation
                  Landmark
                </span>
                <Input
                  label=""
                  variant="flushed"
                  placeholder="e.g., Adjacent to Nextgen Mall main dispatch gate"
                  value={formData.land_mark}
                  onChange={(e) =>
                    handleInputChange('land_mark', e.target.value)
                  }
                />
              </div>

              {/* Logistics Text Area Context */}
              <div className="flex flex-col gap-2">
                <span className="stat-label text-on-surface-variant">
                  Courier Descriptors & Dispatch Directives
                </span>
                <textarea
                  className="w-full p-4 border border-outline bg-surface rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none body-md text-on-surface"
                  rows={3}
                  placeholder="Provide access control pin codes, specific offloading zones, or direct routing references..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                />
              </div>

              {/* Routing Fallback Toggle Component */}
              <div
                className={`
              flex items-center justify-between
               p-4 gap-2 bg-surface-container-low 
               border border-outline-variant rounded-2xl 
               ${formData.is_default ? 'ring-2 ring-primary ' : ''}
               shadow-elevation-1`}
              >
                <div className="flex items-center gap-3">
                  <BiStar
                    className={`text-2xl transition-colors duration-200 ${formData.is_default ? 'text-warning' : 'text-outline'}`}
                  />
                  <div>
                    <span className="text-sm font-black-tight text-on-surface block  tracking-wide">
                      Primary Adddress Location
                    </span>
                    <span className="body-sm text-on-surface-variant">
                      Save this address as your primary delivery location
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.is_default}
                    onChange={(e) =>
                      handleInputChange('is_default', e.target.checked)
                    }
                  />
                  <div className="w-12 h-7 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-surface after:rounded-full after:h-5 after:w-5 after:transition-all shadow-sm"></div>
                </label>
              </div>
            </div>

            {/* Fixed Static Action Footer Control */}
            <div className="flex justify-end items-center gap-4 p-5  border-outline-variant bg-surface-container-low sticky bottom-0 backdrop-blur-md z-20">
              <SubmitButton label="Save Address" className="w-1/2" />
            </div>
          </form>
        )}
      </section>
  );
}

export default AddressForm;
