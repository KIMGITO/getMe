import React, { useEffect, useState } from 'react';
import {
  BiChevronLeft,
  BiEraser,
  BiCheck,
  BiInfoCircle,
  BiXCircle,
  BiTimeFive,
} from 'react-icons/bi';
import {
  useRiderStore,
} from '@/stores/useRiderStore';
import Input from '@/components/UI/Input';
import SubmitButton from '@/components/UI/submit-btn';
import Checkbox from '@/components/UI/CheckBox';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import MapClickHandler from '@/handlers/map-click';
import 'leaflet/dist/leaflet.css';
import ImageDropzone from '@/components/UI/ImageDropZone';
import { useCurrentLocation } from '@/stores/useCurrentLocation';
import Button from '@/components/UI/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useQuery } from '@tanstack/react-query';
import { RiderProfileSkeleton } from '@/components/UI/skeleton/RiderProfileSkeleton';
import { RiderVerificationStatus } from '@/types/riders';
import { riderService } from '@/services/riderService';

export default function RiderProfileForm() {
  const store = useRiderStore();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  
  const [forceEditForm, setForceEditForm] = useState(false);

  // Fetch Verification Status
  const { data: riderVerificationStatus  , isLoading } = useQuery<RiderVerificationStatus>({
    queryKey: ['riderVerificationStatus'],
    queryFn: riderService.verificationStatus,
    enabled: true,
  });

  // Safely extract string status if backend returns an object or a flat string
  const status: 'pending' | 'verified' | 'rejected' | 'incomplete' = 
    typeof riderVerificationStatus === 'string' 
      ? riderVerificationStatus 
      : riderVerificationStatus?.status || 'incomplete';

  const { lat, lng, city } = useCurrentLocation();

  useEffect(() => {
    if (!lat || !lng) return;

    const isAtFallbackLocation =
      store.base_latitude === -1.2921 && store.base_longitude === 36.8219;

    if (isAtFallbackLocation) {
      store.updateFields({
        base_latitude: lat,
        base_longitude: lng,
        base_location_description: city || store.base_location_description,
      });
    }
  }, [lat, lng, city, store]);

  const handleFinalSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setFormErrors({});

    try {
      const payload = store.getSubmissionPayload();

      await riderService.submitProfile(payload);

      // 3. Clear the store and update UI workflow states upon success
      store.clearForm();
      setIsSubmittedSuccessfully(true);
      store.setStep('review');
      
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 500) {
        setSubmitError('An unexpected server error occurred. Please try again.');
      } else if (status === 403) {
        setSubmitError(err.response?.data?.message || 'Access denied.');
      } else if (status === 422) {
        setFormErrors(err.response?.data?.errors || {});
      } else {
        setSubmitError('An unexpected error occurred. Please try again or contact support.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- 1. GLOBAL LOADING SCREEN ---
  if (isLoading) {
    return (
      <RiderProfileSkeleton/>
    );
  }

  // --- 2. VERIFIED STATUS VIEW ---
  if (status === 'verified') {
    return (
      <div className="flex max-w-xl  flex-col items-center justify-center mx-auto text-center p-8 bg-surface-container-lowest  text-on-surface border border-outline-variant/40 elevation-5 my-12 rounded-2xl space-y-4">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-4xl border border-emerald-500/20 shadow-sm">
          <BiCheck />
        </div>
        <h3 className="text-2xl font-black tracking-tight">Rider Access Approved</h3>
        <p className="text-sm text-muted-foreground font-medium max-w-sm">
          Your account status has been successfully verified. You are clear to access your rider dashboard,  available jobs and earn with getMe.
        </p>
        <Button variant="primary" onClick={() => navigate(ROUTES.RIDER_HOME)}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // --- 3. PENDING REVIEW STATUS VIEW ---
  if (status === 'pending' && !isSubmittedSuccessfully) {
    return (
      <div className="flex max-w-xl flex-col items-center justify-center mx-auto text-center p-8 bg-surface-container-lowest text-on-surface border border-outline-variant/40 elevation-5 my-12 rounded-2xl space-y-4">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center text-3xl border border-amber-500/20 shadow-sm">
          <BiTimeFive className="animate-pulse" />
        </div>
        <h3 className="text-2xl font-black tracking-tight">Application Under Review</h3>
        <p className="text-sm text-muted-foreground font-medium max-w-sm">
          We are evaluating your credentials and validating your documents. The onboarding approval protocol usually concludes within 24 hours.
        </p>
        <Button variant="secondary" onClick={() => navigate(ROUTES.RIDER_HOME)}>
          Return to Hub
        </Button>
      </div>
    );
  }

  // --- 4. REJECTED STATUS VIEW ---
  if (status === 'rejected' && !forceEditForm) {
    return (
      <div className="flex max-w-xl flex-col items-center justify-center mx-auto text-center p-8 bg-surface-container-lowest text-on-surface border border-outline-variant/40 elevation-5 my-12 rounded-2xl space-y-4">
        <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center text-3xl border border-error/20 shadow-sm">
          <BiXCircle />
        </div>
        <h3 className="text-2xl font-black tracking-tight text-error">Verification Rejected</h3>
        <p className="text-sm text-muted-foreground font-medium max-w-sm">
          Your documents failed the standard verification metrics. Please audit your information or update unreadable scans.
        </p>
        <div className="flex gap-4">
          <Button variant="primary" onClick={() => setForceEditForm(true)}>
            Modify Profile Fields
          </Button>
          <Button variant="secondary" onClick={() => navigate(ROUTES.RIDER_HOME)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // --- 5. DEFAULT FORM WORKFLOW (INCOMPLETE / FORCE-EDIT REJECTED) ---
  return (
    <div className="flex min-h-[100dvh] flex-col h-full max-w-4xl w-full mx-auto bg-surface-container-lowest text-on-surface border border-outline-variant/40 elevation-5 my-4 rounded-2xl overflow-hidden font-sans antialiased">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low z-10">
        <div className="flex items-center gap-3">
          {store.step !== 'personal' && !isSubmittedSuccessfully && (
            <button
              type="button"
              onClick={() => {
                if (store.step === 'vehicle') store.setStep('personal');
                if (store.step === 'operational') store.setStep('vehicle');
                if (store.step === 'review') store.setStep('operational');
              }}
              className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors"
            >
              <BiChevronLeft className="text-2xl" />
            </button>
          )}
          <h2 className="title-md font-black tracking-tight text-on-surface">
            {store.step === 'personal' && '1. Personal & Sacco Credentials'}
            {store.step === 'vehicle' && '2. Fleet Parameter Matrix'}
            {store.step === 'operational' && '3. Local Navigation Radii Operations'}
            {store.step === 'review' && '4. Validation & Submission Control'}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            setSubmitError(null);
            store.clearForm();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-error hover:bg-error/10 rounded-xl transition-all font-bold"
        >
          <BiEraser className="text-sm" /> Clear Form
        </button>
      </div>

      {/* --- STEP 1: PERSONAL & SACCO --- */}
      {store.step === 'personal' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Input
            label="National ID Number"
            placeholder="e.g. 34567890"
            value={store.id_number}
            onChange={(e) => store.updateFields({ id_number: e.target.value })}
            error={formErrors.id_number?.[0]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageDropzone
              label="National ID Card Scan (Front Side)"
              selectedFile={store.id_front}
              onFileSelect={(file) => store.setFiles({ id_front: file })}
              submitError={formErrors.id_front?.[0]}
            />
            <ImageDropzone
              label="National ID Card Scan (Back Side)"
              selectedFile={store.id_back}
              onFileSelect={(file) => store.setFiles({ id_back: file })}
              submitError={formErrors.id_back?.[0]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Input
              label="Registered SACCO Association Name"
              placeholder="e.g. Trans-Nation Boda Sacco"
              value={store.sacco_name}
              onChange={(e) => store.updateFields({ sacco_name: e.target.value })}
              error={formErrors.sacco_name?.[0]}
            />
            <Input
              label="SACCO Membership Number"
              placeholder="e.g. TRN/2026/R-402"
              value={store.sacco_membership_number}
              onChange={(e) => store.updateFields({ sacco_membership_number: e.target.value })}
              error={formErrors.sacco_membership_number?.[0]}
            />
          </div>

          <div className="pt-4 border-t border-outline-variant">
            <SubmitButton
              label="Continue to Vehicle Details"
              onClick={() => store.setStep('vehicle')}
            />
          </div>
        </div>
      )}

      {/* --- STEP 2: VEHICLE METRICS --- */}
      {store.step === 'vehicle' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black tracking-wide uppercase text-on-surface-variant">
              Select Fleet Segment Type
            </label>
            <div className="grid grid-cols-5 gap-2 p-1.5 bg-surface-container-low border border-outline-variant rounded-2xl">
              {(['bike', 'motorcycle', 'car', 'van', 'truck'] as const).map((type) => (
                <button
                  key={type}
                  disabled={type !== 'motorcycle'}
                  type="button"
                  onClick={() => store.updateFields({ vehicle_type: type })}
                  className={`py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${
                    store.vehicle_type === type
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'hover:bg-surface-variant text-on-surface-variant'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Vehicle Registration Plate Number"
              placeholder="e.g. KMGC 412Y"
              value={store.vehicle_plate_number}
              onChange={(e) => store.updateFields({ vehicle_plate_number: e.target.value })}
              error={formErrors.vehicle_plate_number?.[0]}
            />
            <Input
              label="Vehicle Brand Make / Model"
              placeholder="e.g. Honda Ace 110 / Isuzu NPR"
              value={store.vehicle_model}
              onChange={(e) => store.updateFields({ vehicle_model: e.target.value })}
              error={formErrors.vehicle_model?.[0]}
            />
          </div>

          <div className="pt-4 border-t border-outline-variant">
            <SubmitButton
              label="Proceed to Logistics Mapping"
              onClick={() => store.setStep('operational')}
            />
          </div>
        </div>
      )}

      {/* --- STEP 3: OPERATIONAL HUB MAP --- */}
      {store.step === 'operational' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="w-full h-[300px] min-h-[300px] relative z-0">
            <MapContainer
              center={[store.base_latitude, store.base_longitude]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapClickHandler
                onClick={(lat, lng) =>
                  store.updateFields({
                    base_latitude: lat,
                    base_longitude: lng,
                  })
                }
              />
              <Marker position={[store.base_latitude, store.base_longitude]} />
            </MapContainer>
          </div>

          <div className="p-6 bg-surface border-t border-outline-variant space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Base Operational Hub Description"
                placeholder="e.g. Kilimani Stage Hub / Westlands Node"
                value={store.base_location_description}
                onChange={(e) => store.updateFields({ base_location_description: e.target.value })}
                error={formErrors.base_location_description?.[0]}
              />
              <Input
                label="Maximum Delivery Radius Boundaries (KM)"
                type="number"
                value={store.operating_radius_km.toString()}
                onChange={(e) => store.updateFields({ operating_radius_km: parseInt(e.target.value) || 0 })}
                error={formErrors.operating_radius_km?.[0]}
              />
            </div>
            <Checkbox
              size="md"
              variant="success"
              label="I agree to match active coordinate attributes with local dispatches"
              checked={store.agreed_to_terms}
              onChange={(e) => store.updateFields({ agreed_to_terms: e.target.checked })}
              error={formErrors.agreed_to_terms?.[0]}
            />
            <SubmitButton
              label="Review Registration Profile"
              onClick={() => store.setStep('review')}
            />
          </div>
        </div>
      )}

      {/* --- STEP 4: REVIEW & MULTI-PART TRANSMISSION --- */}
      {store.step === 'review' && (
        <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto p-6 space-y-6">
          {isSubmittedSuccessfully ? (
            <div className="text-center py-8 space-y-4 max-w-md mx-auto">
              <div className="w-16 animate-bounce h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto border border-emerald-500/20">
                <BiCheck />
              </div>
              <h3 className="text-2xl font-black tracking-tight">
                Profile Data Submission Complete
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                Profile information captured successfully. Please wait for up to
                24 hours for your profile to be reviewed for activation.
              </p>

              <Button
                variant="primary"
                className="mt-4"
                onClick={() => {
                  store.clearForm();
                  setForceEditForm(false); 
                  navigate(ROUTES.RIDER_HOME);
                }}
              >
                Ok
              </Button>
            </div>
          ) : (
            <form onSubmit={handleFinalSubmission} className="w-full max-w-xl space-y-6">
              {submitError && (
                <div className="flex items-center gap-2 bg-error/10 border border-error/20 text-error p-4 rounded-xl text-xs font-semibold">
                  <BiInfoCircle className="text-lg shrink-0" /> {submitError}
                </div>
              )}

              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 p-4 rounded-xl text-xs font-semibold">
                <BiInfoCircle className="text-lg shrink-0" /> Review provided information
              </div>

              <div
                className={`border rounded-2xl bg-surface-container-low overflow-hidden divide-y divide-outline-variant/30 text-sm transition-all ${
                  Object.keys(formErrors).length > 0 ? 'border-error/50 shadow-sm' : 'border-outline-variant'
                }`}
              >
                {/* Row 1: ID Document Number */}
                <div className={`p-4 grid grid-cols-3 gap-2 transition-colors ${formErrors.id_number ? 'bg-error-container/10 text-error' : ''}`}>
                  <span className={`font-bold text-xs uppercase tracking-wider ${formErrors.id_number ? 'text-error' : 'text-muted-foreground'}`}>
                    ID Document Number
                  </span>
                  <div className="col-span-2">
                    <span className="font-mono font-bold">{store.id_number}</span>
                    {formErrors.id_number?.map((message, idx) => (
                      <p key={idx} className="text-xs text-error font-semibold mt-1 animate-fadeIn">{message}</p>
                    ))}
                  </div>
                </div>

                {/* Row 2: Sacco Affiliation */}
                <div className={`p-4 grid grid-cols-3 gap-2 transition-colors ${formErrors.sacco_name || formErrors.sacco_membership_number ? 'bg-error-container/10 text-error' : ''}`}>
                  <span className={`font-bold text-xs uppercase tracking-wider ${formErrors.sacco_name || formErrors.sacco_membership_number ? 'text-error' : 'text-muted-foreground'}`}>
                    Sacco Affiliation
                  </span>
                  <div className="col-span-2">
                    <span className="font-medium">{store.sacco_name} (#{store.sacco_membership_number})</span>
                    {formErrors.sacco_name?.map((message, idx) => (
                      <p key={idx} className="text-xs text-error font-semibold mt-1 animate-fadeIn">{message}</p>
                    ))}
                    {formErrors.sacco_membership_number?.map((message, idx) => (
                      <p key={idx} className="text-xs text-error font-semibold mt-1 animate-fadeIn">{message}</p>
                    ))}
                  </div>
                </div>

                {/* Row 3: Fleet Assignment */}
                <div className={`p-4 grid grid-cols-3 gap-2 transition-colors ${formErrors.vehicle_type || formErrors.vehicle_model ? 'bg-error-container/10' : ''}`}>
                  <span className={`font-bold text-xs uppercase tracking-wider ${formErrors.vehicle_type || formErrors.vehicle_model ? 'text-error' : 'text-muted-foreground'}`}>
                    Fleet Assignment
                  </span>
                  <div className="col-span-2">
                    <span className={`capitalize font-bold ${formErrors.vehicle_type || formErrors.vehicle_model ? 'text-error' : 'text-primary'}`}>
                      {store.vehicle_type} — {store.vehicle_model}
                    </span>
                    {formErrors.vehicle_type?.map((message, idx) => (
                      <p key={idx} className="text-xs text-error font-semibold mt-1 animate-fadeIn">{message}</p>
                    ))}
                    {formErrors.vehicle_model?.map((message, idx) => (
                      <p key={idx} className="text-xs text-error font-semibold mt-1 animate-fadeIn">{message}</p>
                    ))}
                  </div>
                </div>

                {/* Row 4: License Plate */}
                <div className={`p-4 grid grid-cols-3 gap-2 transition-colors ${formErrors.vehicle_plate_number ? 'bg-error-container/10 text-error' : ''}`}>
                  <span className={`font-bold text-xs uppercase tracking-wider ${formErrors.vehicle_plate_number ? 'text-error' : 'text-muted-foreground'}`}>
                    License Plate
                  </span>
                  <div className="col-span-2">
                    <span className="font-mono font-bold">{store.vehicle_plate_number}</span>
                    {formErrors.vehicle_plate_number?.map((message, idx) => (
                      <p key={idx} className="text-xs text-error font-semibold mt-1 animate-fadeIn">{message}</p>
                    ))}
                  </div>
                </div>

                {/* Row 5: Uploaded Documents */}
                <div className={`p-4 grid grid-cols-3 gap-2 transition-colors ${formErrors.id_front || formErrors.id_back ? 'bg-error-container/10' : ''}`}>
                  <span className={`font-bold text-xs uppercase tracking-wider ${formErrors.id_front || formErrors.id_back ? 'text-error' : 'text-muted-foreground'}`}>
                    Uploaded Documents
                  </span>
                  <div className="col-span-2 font-medium text-xs space-y-2">
                    <div>
                      <p className={formErrors.id_front ? 'text-error font-bold' : ''}>
                        Front Scan: {store.id_front instanceof File ? '🟢 Loaded' : '🔴 Missing File Link'}
                      </p>
                      {formErrors.id_front?.map((message, idx) => (
                        <p key={idx} className="text-[11px] text-error font-semibold mt-0.5 ml-2 animate-fadeIn">{message}</p>
                      ))}
                    </div>

                    <div>
                      <p className={formErrors.id_back ? 'text-error font-bold' : ''}>
                        Back Scan: {store.id_back instanceof File ? ' 🟢 Loaded' : '🔴 Missing File Link'}
                      </p>
                      {formErrors.id_back?.map((message, idx) => (
                        <p key={idx} className="text-[11px] text-error font-semibold mt-0.5 ml-2 animate-fadeIn">{message}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <SubmitButton
                label={isSubmitting ? 'Streaming Assets...' : 'Verify & Launch Rider Profile'}
                disabled={isSubmitting || !store.id_front || !store.id_back || !store.agreed_to_terms}
              />
            </form>
          )}
        </div>
      )}
    </div>
  );
}